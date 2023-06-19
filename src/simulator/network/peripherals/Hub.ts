import { Vector2D } from "../../drawing/Vector2D";
import { Network } from "../Network";
import { Device } from "./Device";
import { Interface } from "./Interface";
import HubImg from '../../../assets/hub.png';

const HubImage = new Image()
HubImage.src = HubImg

/**
 * Simple ethernet hub
 * 
 * Upon receiving a packet on one of its interface, a hub
 * re-transmits it, untouched, on all of its other interfaces
 */
export class Hub extends Device {
    constructor(network: Network, name: string, ports: number) {
        super(network, name)
        for (let i = 0; i < ports; i++)
            this.addInterface("eth" + i);
    }

    onPacketReceived(iface: Interface, data: ArrayBuffer): void {
        this.getInterfaces().filter(intf => intf !== iface).forEach((intf) => intf.send(data))
    }

    collision(other: Vector2D): boolean {
        return this.getPosition().sqdist(other) < 12*12;
    }

    draw(ctx: CanvasRenderingContext2D, offset: Vector2D): void {
        this.drawSquareImage(ctx, this.getPosition().add(offset), HubImage, 12);
        this.drawInterfaces(ctx, this.getPosition().add(offset), 12, this.getInterfaces(), this.intfPositionSquare);
    }

    tick(): void {
    }

    reset(): void {
    }
}
