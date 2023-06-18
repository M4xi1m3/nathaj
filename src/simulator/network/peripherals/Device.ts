
import { Interface, ReceivedPacketEventData } from './Interface'
import { Network } from '../Network';
import { Drawable } from '../../drawing/Drawable';
import { Vector2D } from '../../drawing/Vector2D';

class DeviceException extends Error {
    device: Device;

    constructor(description: string, device: Device) {
        super(description);
        this.device = device;
    }
}

class InterfaceNameTaken extends DeviceException {
    constructor(device: Device, name: string) {
        super("Device " + device.getName() + " already has an interface named " + name + ".", device);
    }
}

export abstract class Device extends Drawable {
    interfaces: { [id: string]: Interface };
    network: Network
    name: string;

    constructor(network: Network, name: string = "unknown") {
        super();
        this.interfaces = {};
        this.name = name;
        this.network = network;
        this.network.addDevice(this);
    }

    collision(other: Vector2D): boolean {
        return this.position.sqdist(other) < 7*7;
    }

    draw(ctx: CanvasRenderingContext2D, offset: Vector2D): void {
        this.drawCircle(ctx, this.position.add(offset), 7);
        this.drawInterfaces(ctx, this.position.add(offset), 7, Object.values(this.interfaces), 5);
    }

    getText(): string {
        return this.getName();
    }

    abstract onPacketReceived(iface: Interface, data: ArrayBuffer): void;
    abstract tick(): void;
    abstract reset(): void;

    addInterface(name: string): Interface {
        if (name in this.interfaces)
            throw new InterfaceNameTaken(this, name);

        const intf: Interface = new Interface(this, name);
        intf.addEventListener('receivedata', ((e: CustomEvent<ReceivedPacketEventData>) => {
            this.onPacketReceived(intf, e.detail.packet);
        }) as EventListenerOrEventListenerObject);
        this.interfaces[intf.getName()] = intf;
        return intf;
    }

    getInterface(name: string): Interface {
        return this.interfaces[name];
    }

    getFreeInterface(): Interface | undefined {
        return Object.values(this.interfaces).find(i => i.connected_to === null);
    }

    getName(): string {
        return this.name;
    }

    getNetwork(): Network {
        return this.network;
    }

    toString(): string {
        return "<Device " + this.getName() + ">";
    }
}
