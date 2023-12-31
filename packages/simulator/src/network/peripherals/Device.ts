import { Drawable } from '../../drawing/Drawable';
import { Vector2D } from '../../drawing/Vector2D';
import { Mac } from '../../utils/Mac';
import { Network } from '../Network';
import { Interface, isSavedInterface, ReceivedPacketEventData, SavedInterface } from './Interface';

/**
 * Excpetion thrown for an error related to a device
 */
export class DeviceException extends Error {
    device: Device;
    i18n: string;
    i18nargs: any;

    constructor(description: string, device: Device, i18n: string, i18nargs: any) {
        super(description);
        this.device = device;
        this.i18n = i18n;
        this.i18nargs = i18nargs;
    }
}

/**
 * Exception thrown when trying to add an interface to a device which name is already used
 */
export class InterfaceNameTaken extends DeviceException {
    constructor(device: Device, name: string) {
        super(
            'Device ' + device.getName() + ' already has an interface named ' + name + '.',
            device,
            'exception.device.interfacenametaken',
            {
                name: device.getName(),
                interface: name,
            }
        );
    }
}

/**
 * Exception thrown when trying to remove an interface that doesn't existe on a device
 */
export class InterfaceNotFound extends DeviceException {
    constructor(device: Device, name: string) {
        super(
            'Device ' + device.getName() + ' has no interface named ' + name + '.',
            device,
            'exception.device.interfacenotfound',
            {
                name: device.getName(),
                interface: name,
            }
        );
    }
}

/**
 * Exception thrown when trying to add a device to a device which name is already used
 */
export class NoFreeInterfaces extends DeviceException {
    constructor(device: Device) {
        super(
            'No free interfaces available on device ' + device.getName() + '.',
            device,
            'exception.device.nofreeinterface',
            {
                name: device.getName(),
            }
        );
    }
}

/**
 * Exception thrown when trying get the network of a device that has been removed
 */
export class DeviceRemoved extends DeviceException {
    constructor(device: Device) {
        super('Device ' + device.getName() + ' has been removed.', device, 'exception.device.deviceremoved', {
            name: device.getName(),
        });
    }
}

export interface SavedDevice<T extends SavedInterface = SavedInterface> {
    type: string;
    name: string;
    interfaces: T[];
    x: number;
    y: number;
}

export function isSavedDevice(arg: any): arg is SavedDevice {
    return (
        arg &&
        arg.type !== undefined &&
        typeof arg.type === 'string' &&
        arg.name !== undefined &&
        typeof arg.name === 'string' &&
        arg.x !== undefined &&
        typeof arg.x === 'number' &&
        arg.y !== undefined &&
        typeof arg.y === 'number' &&
        arg.interfaces !== undefined &&
        typeof arg.interfaces === 'object' &&
        Array.isArray(arg.interfaces) &&
        (arg.interfaces as any[]).map(isSavedInterface).reduce((prev, curr) => prev && curr)
    );
}

/**
 * A device in the network simulation
 */
export abstract class Device<T extends Interface = Interface> extends Drawable implements EventTarget {
    /**
     * Interfaces of the device, indexed by name
     */
    private interfaces: { [id: string]: T };

    /**
     * Network the device is associated with
     */
    private network?: Network;

    /**
     * Name of the device
     */
    private name: string;

    /**
     * Event target of the device
     */
    event_target: EventTarget;

    /**
     * Initialize a device
     *
     * @param {Network} network Network to which the device belongs
     * @param {string} [name='unknown'] Name of the device in the network
     */
    public constructor(network: Network, name = 'unknown') {
        super();
        this.event_target = new EventTarget();
        this.interfaces = {};
        this.name = name;
        this.network = network;
        this.network.addDevice(this);
    }

    public collision(other: Vector2D): boolean {
        return this.getPosition().sqdist(other) < 7 * 7;
    }

    public getText(): string {
        return this.getName();
    }

    /**
     * Generate the next mac address for an interface in the device.
     *
     * @returns {string} New mac address (or '' if no interfaces are in the device)
     */
    public generateNextMacAddress(): string {
        if (this.getInterfaces().length === 0) return Device.getNextAvailableMac(this.getNetwork());
        return Mac.fromInt(
            this.getInterfaces()
                .map((i) => Mac.toInt(i.getMac()))
                .reduce((m, e) => (e > m ? e : m)) + 1n
        );
    }

    /**
     * Generate the next interface name for the device.
     *
     * @returns {string} Next intezrface name
     */
    public generateNextIntfName(): string {
        for (let i = 0; ; i++) {
            if (!this.hasInterface('eth' + i)) {
                return 'eth' + i;
            }
        }
    }

    /**
     * Event handler called when a packet is received on an interface
     *
     * @param {Interface} iface Interfave on whick the packet has been received
     * @param {ArrayBuffer} data Data in the packet
     */
    public abstract onPacketReceived(iface: T, data: ArrayBuffer): void;

    /**
     * Method called every network tick
     */
    public abstract tick(): void;

    /**
     * Reset the device
     */
    public abstract reset(): void;

    /**
     * Get the type of the device
     *
     * @returns Type of the device
     */
    abstract getType(): string;

    /**
     * Serialize a device
     *
     * @return {SavedDevice} The serialized device
     */
    abstract save(): SavedDevice;

    protected createInterface<U extends Device = Device>(
        name: string,
        mac: string,
        ctor: { new (dev: U, name: string, mac: string): T }
    ): T {
        if (name in this.interfaces) throw new InterfaceNameTaken(this, name);

        const intf: T = new ctor(this as unknown as U, name, mac);
        intf.addEventListener('receivedata', ((e: CustomEvent<ReceivedPacketEventData>) => {
            this.onPacketReceived(intf, e.detail.packet);
        }) as EventListenerOrEventListenerObject);
        this.interfaces[intf.getName()] = intf;

        this.changed();

        return intf as T;
    }

    /**
     * Get device common name prefix
     *
     * @returns {string} Prefix
     */
    public static getDevNamePrefix(): string {
        return 'dev';
    }

    /**
     * Get the device common interface prefix
     *
     * @returns  {string} Prefix
     */
    public static getDevMacPrefix(): string {
        return '00';
    }

    /**
     * Get the next available name for this type of device
     *
     * @return {string} Next available name
     */
    public static getNextAvailableName(net: Network): string {
        for (let i = 0; ; i++) {
            if (!net.hasDevice(this.getDevNamePrefix() + i)) {
                return this.getDevNamePrefix() + i;
            }
        }
    }

    /**
     * Get the next available MAC for this type of device.
     *
     * This generates mac addresses of type
     * 02:00:00:XX:YY:ZZ
     * With:
     *  - XX: The type of device
     *  - YY: The id of the device
     *  - ZZ: The id of the interface in the device
     *
     * @param net
     */
    public static getNextAvailableMac(net: Network): string {
        for (let i = 0; ; i++) {
            const mac = `02:00:00:${this.getDevMacPrefix()}:${i.toString(16).padStart(2, '0')}:00`;
            if (!net.isMACUsed(mac)) {
                return mac;
            }
        }
    }

    /**
     * Add an interface to the device
     *
     * @param {string} name Name of the interface
     * @returns {Interface} The new interface
     */
    public addInterface(name?: string, mac?: string): T {
        if (name === undefined) name = this.generateNextIntfName();
        if (mac === undefined) mac = this.generateNextMacAddress();

        const intf = this.createInterface(
            name,
            mac,
            Interface as unknown as new (dev: Device<Interface>, name: string, mac: string) => T
        );

        this.changed();

        return intf;
    }

    public removeAllInterfaces(): void {
        this.getInterfaces().forEach((intf) => {
            this.removeInterface(intf.getName());
        });
    }

    /**
     * Remove an interface from a device
     *
     * @param {string} name Name of the interface
     */
    public removeInterface(name: string): void {
        if (!(name in this.interfaces)) throw new InterfaceNotFound(this, name);

        const intf = this.getInterface(name);
        if (intf.isConnected()) intf.disconnect();

        delete intf['owner'];
        delete this.interfaces[name];

        this.changed();
    }

    /**
     * Get an interface by name
     *
     * @param {string} name Name of the interface to get
     * @returns {Interface} The interface
     */
    public getInterface(name: string): T | undefined {
        if (!(name in this.interfaces)) throw new InterfaceNotFound(this, name);

        return this.interfaces[name];
    }

    /**
     * Check if the device has an interface
     *
     * @param {string} name Interface name to check for
     * @returns {boolean} True if the device has an interface with that name, fals otherwise
     */
    public hasInterface(name: string): boolean {
        return name in this.interfaces;
    }

    /**
     * Get all the interfaces of the device
     *
     * @returns {Interface[]} List of interfaces
     */
    public getInterfaces(): T[] {
        return Object.values(this.interfaces);
    }

    /**
     * Get the first available interface
     *
     * @returns {Interface} Available interface, or undefined if no interfaces available
     */
    public getFreeInterface(ignore?: string[]): T {
        let intfs = this.getInterfaces();
        if (ignore !== undefined) {
            intfs = intfs.filter((intf) => ignore.indexOf(intf.getName()) === -1);
        }

        const intf = intfs.find((i) => i.getConnection() === null);
        if (intf === undefined) {
            throw new NoFreeInterfaces(this);
        }
        return intf;
    }

    /**
     * Check if the device has a free interface
     *
     * @returns {boolean} True if the device has a free interface, false otherwise
     */
    public hasFreeInterface(): boolean {
        const intf = Object.values(this.interfaces).find((i) => !i.isConnected());
        return intf !== undefined;
    }

    /**
     * Check if the device has a connected interface
     *
     * @returns {boolean} True if the device has a connected interface, false otherwise
     */
    public hasConnectedInterface(): boolean {
        const intf = Object.values(this.interfaces).find((i) => i.isConnected());
        return intf !== undefined;
    }

    /**
     * Get the name of the device
     *
     * @returns {string} Name of the device
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Get the network the device belongs to
     *
     * @returns {Network} The network the device belongs to
     */
    public getNetwork(): Network {
        if (this.network === undefined) throw new DeviceRemoved(this);

        return this.network;
    }

    /**
     * Get a string representation of the device
     *
     * @returns {string} String representation of the device
     */
    public toString(): string {
        return '<Device ' + this.getName() + '>';
    }

    /**
     * Get the network time
     *
     * @returns {number} Network time
     */
    public time(): number {
        return this.getNetwork().time();
    }

    /**
     * Dispatch the changed event on the device.
     */
    public changed() {
        this.dispatchEvent(new Event('changed'));
    }

    /**
     * Dispatch the poschanged event on the device.
     */
    public posChanged() {
        this.dispatchEvent(new Event('poschanged'));
    }

    public setPosition(position: Vector2D) {
        super.setPosition(position);
        this.posChanged();
    }

    public isDeviceMac(mac: string) {
        return this.getInterfaces().find((i) => i.getMac() === mac) !== undefined;
    }

    // TODO: Find a better way to make the class extend Drawable and also
    // be an EventEmitter. This works but it is ugly.

    addEventListener(
        type: string,
        callback: EventListenerOrEventListenerObject | null,
        options?: boolean | AddEventListenerOptions | undefined
    ): void {
        this.event_target.addEventListener(type, callback, options);
    }

    dispatchEvent(event: Event): boolean {
        return this.event_target.dispatchEvent(event);
    }

    removeEventListener(
        type: string,
        callback: EventListenerOrEventListenerObject | null,
        options?: boolean | EventListenerOptions | undefined
    ): void {
        this.event_target.removeEventListener(type, callback, options);
    }
}
