import { Vector2D } from "../../drawing/Vector2D";
import { Network } from "../Network";
import { Device } from "./Device";
import { Interface } from "./Interface";
import HubImg from '../../../assets/hub.png';

const HubImage = new Image()
HubImage.src = HubImg

export class Hub extends Device {
    mac: string;

    constructor(network: Network, name: string, mac: string, ports: number) {
        super(network, name)
        for (let i = 0; i < ports; i++)
            this.addInterface("eth" + i);
        this.mac = mac;
    }

    onPacketReceived(iface: Interface, data: ArrayBuffer): void {
        for (const intf of Object.values(this.interfaces)) {
            if (intf !== iface)
                intf.send(data);
        }
    }

    collision(other: Vector2D): boolean {
        return this.position.sqdist(other) < 12*12;
    }

    draw(ctx: CanvasRenderingContext2D, offset: Vector2D): void {
        this.drawSquareImage(ctx, this.position.add(offset), HubImage, 12, Object.values(this.interfaces), 5);
    }

    tick(): void {
    }

    reset(): void {
    }
}
