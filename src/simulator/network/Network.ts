import { Mac } from '../utils/Mac';
import { Device, isSavedDevice, SavedDevice } from './peripherals/Device';
import { Host, isSavedHost } from './peripherals/Host';
import { Hub, isSavedHub } from './peripherals/Hub';
import { Interface, SavedInterface } from './peripherals/Interface';
import { isSavedSTPSwitch, STPSwitch } from './peripherals/STPSwitch';
import { isSavedSwitch, Switch } from './peripherals/Switch';

/**
 * Excpetion thrown for an error related to the network
 */
export class NetworkException extends Error {
    network: Network;
    i18n: string;
    i18nargs: any;

    constructor(description: string, network: Network, i18n: string, i18nargs: any) {
        super(description);
        this.network = network;
        this.i18n = i18n;
        this.i18nargs = i18nargs;
    }
}

/**
 * Exception thrown when trying to add a device with existing name in the network
 */
export class DeviceNameTaken extends NetworkException {
    constructor(network: Network, name: string) {
        super('Device ' + name + ' already exists in network!', network, 'exception.network.devicenametaken', {
            name: name,
        });
    }
}

/**
 * Exception thrown when trying to remove a device that doesn't exist in the network
 */
export class DeviceNotFound extends NetworkException {
    constructor(network: Network, name: string) {
        super('Device ' + name + ' does net exist!', network, 'exception.network.devicenotfound', {
            name: name,
        });
    }
}

/**
 * Exception thrown when trying to start the network while it's running
 */
export class NetworkAlreadyRunningException extends NetworkException {
    constructor(network: Network) {
        super('Network is already running', network, 'exception.network.alreadyrunning', {});
    }
}

/**
 * Exception thrown when trying to stio the network while it's not running
 */
export class NetworkNotRunningException extends NetworkException {
    constructor(network: Network) {
        super('Network is not running', network, 'exception.network.notrunning', {});
    }
}

export class InvalidNetwork extends Error {
    i18n = 'exception.network.invalid';
    i18nargs: any = {};

    constructor() {
        super('Invalid network');
    }
}

/**
 * Direction of the packet, relative to the interface
 */
export type PacketDirection = 'outgoing' | 'ingoing';

/**
 * Type storing the data of a packet event
 */
export type PacketEventData = {
    /**
     * Network time at which the event occured
     */
    time: number;

    /**
     * Data stored in the packet
     */
    packet: ArrayBuffer;

    /**
     * The interface that triggered the event
     */
    interface: Interface;

    /**
     * The direction of the packet, relative to the interface
     */
    direction: PacketDirection;
};

export interface SavedNetwork {
    devices: SavedDevice[];
}

export function isSavedNetwork(arg: any): arg is SavedNetwork {
    return (
        arg &&
        arg.devices !== undefined &&
        typeof arg.devices === 'object' &&
        Array.isArray(arg.devices) &&
        (arg.devices as any[]).map(isSavedDevice).reduce((prev, curr) => prev && curr) &&
        (arg.devices as any[])
            .map((d) => isSavedHost(d) || isSavedHub(d) || isSavedSwitch(d) || isSavedSTPSwitch(d))
            .reduce((prev, curr) => prev && curr)
    );
}

/**
 * Main network class, storing all of the devices
 * and states of the network
 */
export class Network extends EventTarget {
    /**
     * Devices in the network, indexed by their names
     */
    private devices: { [name: string]: Device };

    /**
     * Timer object returned by setInterval
     */
    private interval: number | null;

    /**
     * Offset to add to time to get the network time
     */
    private time_offset: number;

    /**
     * Time elapsed (updated when pausing)
     */
    private time_elapsed: number;

    /**
     * Real time the network was paused at
     */
    private paused_at: number;

    /**
     * Simulation speed factor of the network.
     */
    private speed: number;

    /**
     * Create a network
     */
    public constructor() {
        super();

        this.devices = {};
        this.interval = null;
        this.time_offset = 0;
        this.time_elapsed = 0;
        this.paused_at = 0;
        this.speed = 1;
    }

    /**
     * Add a device to the network
     *
     * @param {Device} device Device to add
     */
    public addDevice(device: Device): void {
        if (device.getName() in this.devices) throw new DeviceNameTaken(this, device.getName());

        this.devices[device.getName()] = device;

        this.dispatchEvent(new Event('modified'));
    }

    /**
     * Remove a device in the network
     *
     * @param {string} device Device to remove
     */
    public removeDevice(device: string): void {
        if (!(device in this.devices)) throw new DeviceNotFound(this, device);

        for (const intf of this.devices[device].getInterfaces()) {
            if (intf.isConnected()) intf.disconnect();
        }

        delete this.devices[device]['network'];
        delete this.devices[device];

        this.dispatchEvent(new Event('modified'));
    }

    /**
     * Get a device by name
     *
     * @returns {Device} Requested device
     */
    public getDevice(name: string): Device {
        if (!(name in this.devices)) throw new DeviceNotFound(this, name);

        return this.devices[name];
    }

    /**
     * Check if a device name is taken
     *
     * @param {string} name Name to check for
     * @returns {boolean} True if name is already used, false otherwise
     */
    public hasDevice(name: string): boolean {
        return name in this.devices;
    }

    /**
     * Get all the devices in the network
     *
     * @returns {Device[]} List of the devices
     */
    public getDevices(): Device[] {
        return Object.values(this.devices);
    }

    /**
     * Check if a device in the network is using a MAC address
     *
     * @param {string} mac MAC address to check for
     * @param {number} range Span of the range of mac address to check
     * @returns {boolean} True if the MAC address is used, false otherwise
     */
    public isMACUsed(mac: string, range = 0) {
        mac = mac.toLowerCase();

        if (!Mac.isValid(mac)) return false;

        for (const dev of this.getDevices()) {
            for (const intf of dev.getInterfaces()) {
                for (let i = 0; i <= range; i++) {
                    if (intf.getMac() === Mac.increment(mac, i)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Utility method to add a link between two interfaces.
     * If dev2 and intf2 are not provided, dev1 is unsed as first device
     * and intf1 as second device, and the first available interface of
     * each are connected together.
     *
     * @param {string} dev1 Name of the device
     * @param {string} intf1 Name of the interface in the device
     * @param {string} [dev2] Name of the other device
     * @param {string} [intf2] Name of the interface ibn the other device
     */
    public addLink(dev1: string, intf1: string, dev2?: string, intf2?: string) {
        if (dev2 !== undefined && intf2 !== undefined) {
            this.getDevice(dev1).getInterface(intf1).connect(this.getDevice(dev2).getInterface(intf2));
            this.dispatchEvent(new Event('modified'));
        } else {
            const inf1 = this.getDevice(dev1).getFreeInterface();

            let ignore = undefined;
            if (dev1 === intf1) {
                ignore = [inf1.getName()];
            }

            const inf2 = this.getDevice(intf1).getFreeInterface(ignore);

            if (inf1 !== undefined && inf2 !== undefined) {
                inf1.connect(inf2);
                this.dispatchEvent(new Event('modified'));
            }
        }
    }

    /**
     * Utility method to add a link between two interfaces.
     * If dev2 and intf2 are not provided, dev1 is unsed as first device
     * and intf1 as second device, and the first available interface of
     * each are connected together.
     *
     * @param {string} dev1 Name of the device
     * @param {string} intf1 Name of the interface in the device
     * @param {string} dev2 Name of the other device
     * @param {string} intf2 Name of the interface ibn the other device
     */
    public addLinkIfDoesntExist(dev1: string, intf1: string, dev2: string, intf2: string) {
        if (this.getDevice(dev1).getInterface(intf1).isConnected()) return;
        if (this.getDevice(dev2).getInterface(intf2).isConnected()) return;
        this.getDevice(dev1).getInterface(intf1).connect(this.getDevice(dev2).getInterface(intf2));
        this.dispatchEvent(new Event('modified'));
    }

    /**
     * Utility method to remove a link wetween two interfaces.
     * If dev2 and intf2 are not provided, dev1 is unsed as first device
     * and intf1 as second device, and all connections between them
     * are removed.
     *
     * @param {string} dev1 Name of the device
     * @param {string} intf1 Name of the interface in the device
     * @param {string} [dev2] Name of the other device
     * @param {string} [intf2] Name of the interface ibn the other device
     */
    public removeLink(dev1: string, intf1: string, dev2?: string, intf2?: string) {
        if (dev2 !== undefined && intf2 !== undefined) {
            if (this.getDevice(dev1).getInterface(intf1).getConnection() === this.getDevice(dev2).getInterface(intf2))
                this.getDevice(dev1).getInterface(intf1).disconnect();
            this.dispatchEvent(new Event('modified'));
        } else {
            const dev2 = this.getDevice(intf1);
            for (const intf of this.getDevice(dev1).getInterfaces()) {
                if (intf.isConnected()) {
                    if (intf.getConnection()?.getOwner() === dev2) {
                        intf.disconnect();
                        this.dispatchEvent(new Event('modified'));
                    }
                }
            }
        }
    }

    /**
     * Run a network simulation tick
     *
     * This goes over all the devices and make thein interfaces
     * process incomming packets, then call the tick method on the device.
     */
    public tick(): void {
        for (const device of Object.values(this.devices)) {
            for (const intf of device.getInterfaces()) {
                intf.tick();
            }
            device.tick();
        }
    }

    /**
     * Get the network time
     *
     * @returns {number} The current network time
     */
    public time(): number {
        if (!this.isRunning()) return this.paused_at;
        return ((performance.now() - this.time_offset) * this.getSpeed() + this.time_elapsed) / 1000;
    }

    public getSpeed(): number {
        return this.speed;
    }

    public setSpeed(speed: number) {
        if (speed <= 0 || isNaN(speed) || speed === Infinity || speed === -Infinity) {
            throw new RangeError();
        }
        if (this.isRunning()) {
            this.time_elapsed += (performance.now() - this.time_offset) * this.getSpeed();
            this.time_offset = performance.now();
        }
        this.speed = speed;
    }

    /**
     * Start the network simulation
     *
     * This uses setInterval to create a non-blocking
     * infinite loop. This guarantees a call to tick every 4-20ms.
     */
    public start(): void {
        if (this.interval !== null) throw new NetworkAlreadyRunningException(this);

        this.time_offset = performance.now();
        this.interval = window.setInterval(() => {
            // TODO: Measure performance to run multiple calls to tick
            // allowing to not be blocked by the 4 ms lower limit imposed
            // by setInterval
            this.tick();
        }, 0);
        this.dispatchEvent(new Event('changed'));
    }

    /**
     * Stop the network simulation
     */
    public stop(): void {
        if (this.interval === null) throw new NetworkNotRunningException(this);

        clearInterval(this.interval);

        this.paused_at = this.time();
        this.time_elapsed += (performance.now() - this.time_offset) * this.getSpeed();

        this.interval = null;
        this.dispatchEvent(new Event('changed'));
    }

    /**
     * Reset the network states. If the network is running, we stop it.
     */
    public reset(): void {
        if (this.isRunning()) this.stop();
        this.time_offset = 0;
        this.time_elapsed = 0;
        this.paused_at = 0;

        Object.values(this.devices).forEach((dev) => {
            dev.reset();

            dev.getInterfaces().forEach((intf) => {
                intf.reset();
            });
        });
        this.dispatchEvent(new Event('changed'));
    }

    /**
     * Reset and clear the network, removing all devices.
     */
    public clear(): void {
        this.reset();
        this.devices = {};
        this.dispatchEvent(new Event('changed'));
        this.dispatchEvent(new Event('modified'));
    }

    /**
     * Check if the network simulation is running
     *
     * @returns {boolean} True if the network simulation is running, false otherwise.
     */
    public isRunning(): boolean {
        return this.interval !== null;
    }

    /**
     * Serialize the network to a json-ifyable object
     *
     * @returns {SavedNetwork} the network
     */
    public save(): SavedNetwork {
        return {
            devices: this.getDevices().map((dev) => dev.save()),
        };
    }

    /**
     * Reset and load the network from json
     *
     * @param {NetworkData} data Data to load from
     */
    public load(data: any) {
        if (!isSavedNetwork(data)) throw new InvalidNetwork();

        this.clear();

        data.devices.forEach((dev: SavedDevice) => {
            if (isSavedHost(dev)) {
                Host.load(this, dev);
            } else if (isSavedHub(dev)) {
                Hub.load(this, dev);
            } else if (isSavedSwitch(dev)) {
                Switch.load(this, dev);
            } else if (isSavedSTPSwitch(dev)) {
                STPSwitch.load(this, dev);
            }
        });

        data.devices.forEach((dev: SavedDevice) => {
            dev.interfaces.forEach((intf: SavedInterface) => {
                if (intf.connected_to !== undefined)
                    this.addLinkIfDoesntExist(
                        dev.name,
                        intf.name,
                        intf.connected_to.device,
                        intf.connected_to.interface
                    );
            });
        });

        this.reset();
    }
}
