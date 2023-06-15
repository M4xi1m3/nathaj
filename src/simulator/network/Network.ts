
import { Device } from './peripherals/Device';
import { Interface } from './peripherals/Interface';

class NetworkException extends Error {
    network: Network;

    constructor(description: string, network: Network) {
        super(description);
        this.network = network;
    }
}

class DeviceNameTaken extends NetworkException {
    constructor(network: Network, name: string) {
        super("Device " + name + " already exists in network!", network);
    }
}

class NetworkAlreadyRunningException extends NetworkException {
    constructor(network: Network) {
        super("Network is already running", network);
    }
}

class NetworkNotRunningException extends NetworkException {
    constructor(network: Network) {
        super("Network is not running", network);
    }
}

type PacketDirection = 'outgoing' | 'ingoing';

export type PacketEventData = {
    time: number;
    packet: ArrayBuffer;
    interface: Interface;
    direction: PacketDirection;
}

export class Network extends EventTarget {
    devices: { [name: string]: Device };
    interval: number | null;
    running: boolean;
    time_offset: number;
    time_elapsed: number;

    constructor() {
        super();

        this.devices = {}
        this.interval = null;
        this.running = false;
        this.time_offset = 0;

        this.time_elapsed = 0;
    }

    addDevice(device: Device): void {
        if (device.getName() in this.devices)
            throw new DeviceNameTaken(this, device.getName());

        this.devices[device.getName()] = device;
    }

    addLink(dev1: string, intf1: string, dev2: string, intf2: string) {
        this.devices[dev1].getInterface(intf1).connect(this.devices[dev2].getInterface(intf2));
    }

    tick(): void {
        for (const device of Object.values(this.devices)) {
            for(const intf of Object.values(device.interfaces)) {
                intf.tick();
            }
            device.tick();
        }
    }

    time(): number {
        return (performance.now() - this.time_offset + this.time_elapsed) / 1000;
    }

    start(): void {
        if (this.interval !== null)
            throw new NetworkAlreadyRunningException(this);

        this.time_offset = performance.now();
        this.interval = window.setInterval(() => {
            this.tick();
        }, 0)
    }

    stop(): void {
        if (this.interval === null)
            throw new NetworkNotRunningException(this);

        this.time_elapsed += performance.now() - this.time_offset;

        clearInterval(this.interval);
        this.interval = null;
    }
}