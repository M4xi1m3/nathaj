
import { Device } from './peripherals/Device';

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

export class Network {
    devices: { [name: string]: Device };
    interval: number | null;
    running: boolean;

    constructor() {
        this.devices = {}
        this.interval = null;
        this.running = false;
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

    start(): void {
        if (this.interval !== null)
            throw new NetworkAlreadyRunningException(this);

        this.interval = window.setInterval(() => {
            this.tick()
        }, 0)
    }

    stop(): void {
        if (this.interval === null)
            throw new NetworkNotRunningException(this);

        clearInterval(this.interval);
        this.interval = null;
    }
}
