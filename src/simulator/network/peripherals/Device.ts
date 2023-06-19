
import { Interface, ReceivedPacketEventData } from './Interface'
import { Network } from '../Network';
import { Drawable } from '../../drawing/Drawable';
import { Vector2D } from '../../drawing/Vector2D';

/**
 * Excpetion thrown for an error related to a device
 */
export class DeviceException extends Error {
    device: Device;

    constructor(description: string, device: Device) {
        super(description);
        this.device = device;
    }
}

/**
 * Exception thrown when trying to add a device to a device which name is already used
 */
export class InterfaceNameTaken extends DeviceException {
    constructor(device: Device, name: string) {
        super("Device " + device.getName() + " already has an interface named " + name + ".", device);
    }
}

/**
 * A device in the network simulation
 */
export abstract class Device extends Drawable {
    /**
     * Ijnterfaces of the device, indexed by name
     */
    private interfaces: { [id: string]: Interface };

    /**
     * Network the device is associated with
     */
    private network: Network;

    /**
     * Name of the device
     */
    private name: string;

    /**
     * Initialize a device
     * 
     * @param {Network} network Network to which the device belongs
     * @param [string="unknown"] name Name of the device in the network
     */
    public constructor(network: Network, name: string = "unknown") {
        super();
        this.interfaces = {};
        this.name = name;
        this.network = network;
        this.network.addDevice(this);
    }

    public collision(other: Vector2D): boolean {
        return this.getPosition().sqdist(other) < 7 * 7;
    }

    public draw(ctx: CanvasRenderingContext2D, offset: Vector2D): void {
        this.drawCircle(ctx, this.getPosition().add(offset), 7);
        this.drawInterfaces(ctx, this.getPosition().add(offset), 7, Object.values(this.interfaces));
    }

    public getText(): string {
        return this.getName();
    }

    /**
     * Event handler called when a packet is received on an interface
     * 
     * @param {Interface} iface Interfave on whick the packet has been received
     * @param {ArrayBuffer} data Data in the packet
     */
    public abstract onPacketReceived(iface: Interface, data: ArrayBuffer): void;

    /**
     * Method called every network tick
     */
    public abstract tick(): void;

    /**
     * Reset the device
     */
    public abstract reset(): void;

    /**
     * Add an interface to the device
     * 
     * @param {string} name Name of the interface
     * @returns {Interface} The new interface
     */
    public addInterface(name: string): Interface {
        if (name in this.interfaces)
            throw new InterfaceNameTaken(this, name);

        const intf: Interface = new Interface(this, name);
        intf.addEventListener('receivedata', ((e: CustomEvent<ReceivedPacketEventData>) => {
            this.onPacketReceived(intf, e.detail.packet);
        }) as EventListenerOrEventListenerObject);
        this.interfaces[intf.getName()] = intf;
        return intf;
    }

    /**
     * Get an interface by name
     * 
     * @param {string} name Name of the interface to get
     * @returns {Interface} The interface
     */
    public getInterface(name: string): Interface {
        return this.interfaces[name];
    }

    /**
     * Get all the interfaces of the device
     * 
     * @returns {Interface[]} List of interfaces
     */
    public getInterfaces(): Interface[] {
        return Object.values(this.interfaces);
    }

    /**
     * Get the first available interface
     * 
     * @returns {Interface | undefined} Available interface, or undefined if no interfaces available
     */
    public getFreeInterface(): Interface | undefined {
        return Object.values(this.interfaces).find(i => i.getConnection() === null);
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
        return this.network;
    }

    /**
     * Get a string representation of the device
     * 
     * @returns {string} String representation of the device
     */
    public toString(): string {
        return "<Device " + this.getName() + ">";
    }

    /**
     * Get the network time
     * 
     * @returns {number} Network time
     */
    public time(): number {
        return this.network.time();
    }
}
