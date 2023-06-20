import { Device } from './peripherals/Device';
import { Interface } from './peripherals/Interface';

/**
 * Excpetion thrown for an error related to the network
 */
export class NetworkException extends Error {
    network: Network;

    constructor(description: string, network: Network) {
        super(description);
        this.network = network;
    }
}

/**
 * Exception thrown when trying to add a device with existing name in the network
 */
export class DeviceNameTaken extends NetworkException {
    constructor(network: Network, name: string) {
        super('Device ' + name + ' already exists in network!', network);
    }
}

/**
 * Exception thrown when trying to start the network while it's running
 */
export class NetworkAlreadyRunningException extends NetworkException {
    constructor(network: Network) {
        super('Network is already running', network);
    }
}

/**
 * Exception thrown when trying to stio the network while it's not running
 */
export class NetworkNotRunningException extends NetworkException {
    constructor(network: Network) {
        super('Network is not running', network);
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
     * Create a network
     */
    public constructor() {
        super();

        this.devices = {};
        this.interval = null;
        this.time_offset = 0;
        this.time_elapsed = 0;
        this.paused_at = 0;
    }

    /**
     * Add a device to the network
     *
     * @param {Device} device Device to add
     */
    public addDevice(device: Device): void {
        if (device.getName() in this.devices) throw new DeviceNameTaken(this, device.getName());

        this.devices[device.getName()] = device;
    }

    /**
     * Get a device by name
     *
     * @returns {Device} Requested device
     */
    public getDevice(name: string): Device {
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
     * Utility method to add a link wetween two interfaces.
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
            this.devices[dev1].getInterface(intf1).connect(this.devices[dev2].getInterface(intf2));
        } else {
            const inf1 = this.devices[dev1].getFreeInterface();
            const inf2 = this.devices[intf1].getFreeInterface();

            if (inf1 !== undefined && inf2 !== undefined) {
                inf1.connect(inf2);
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
        return (performance.now() - this.time_offset + this.time_elapsed) / 1000;
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
            // allowing to don't be blocked by the 4 ms lower limit imposed
            // by setInterval
            this.tick();
        }, 0);
    }

    /**
     * Stop the network simulation
     */
    public stop(): void {
        if (this.interval === null) throw new NetworkNotRunningException(this);

        clearInterval(this.interval);

        this.paused_at = this.time();
        this.time_elapsed += performance.now() - this.time_offset;

        this.interval = null;
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
        });
    }

    /**
     * Reset and clear the network, removing all devices.
     */
    public clear(): void {
        this.reset();
        this.devices = {};
    }

    /**
     * Check if the network simulation is running
     *
     * @returns {boolean} True if the network simulation is running, false otherwise.
     */
    public isRunning(): boolean {
        return this.interval !== null;
    }
}
