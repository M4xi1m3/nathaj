
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
        const DEV_RADIUS = 7;
        const INTF_RADIUS = 4;

        ctx.fillStyle = "#000000";
        ctx.beginPath();
        const drawPos = this.position.add(offset);
        ctx.arc(drawPos.x, drawPos.y, DEV_RADIUS, 0, 2 * Math.PI);
        ctx.fill();

        for (const intf of Object.values(this.interfaces)) {
            if (intf.connected_to !== null) {
                const direction = this.position.direction(intf.connected_to.getOwner().position)
                const intfPos = drawPos.add(direction.mul(DEV_RADIUS + INTF_RADIUS))

                ctx.fillStyle = "#00ff00";
                ctx.beginPath();
                ctx.arc(intfPos.x, intfPos.y, INTF_RADIUS, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
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
