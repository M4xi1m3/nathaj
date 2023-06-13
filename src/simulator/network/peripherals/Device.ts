
import { Interface, ReceivedPacketEventData } from './Interface'
import { Network } from '../Network';
import { Drawable } from '../../drawing/Drawable';

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

    collision(x: number, y: number): boolean {
        if (x > (this.x - 10) && x < (this.x + 10) && y > (this.y - 10) && y < (this.y + 10))
            return true
        return false
    }

    draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number): void {
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(this.x + offsetX, this.y + offsetY, 10, 0, 2 * Math.PI);
        ctx.fill();

        for (const intf of Object.values(this.interfaces)) {
            if (intf.connected_to !== null) {
                const other_x = intf.connected_to.getOwner().x;
                const other_y = intf.connected_to.getOwner().y;

                const len = Math.sqrt((other_x - this.x) ** 2 + (other_y - this.y) ** 2);
                const dx = (other_x - this.x) / len;
                const dy = (other_y - this.y) / len;

                const ix = this.x + offsetX + dx * 15;
                const iy = this.y + offsetY + dy * 15;

                ctx.fillStyle = "#00ff00";
                ctx.beginPath();
                ctx.arc(ix, iy, 5, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }

    getText(): string {
        return this.getName();
    }

    abstract onPacketReceived(iface: Interface, data: any): void;
    abstract tick(): void;

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
