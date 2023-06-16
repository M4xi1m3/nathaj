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
        const DEV_RADIUS = 12;
        const INTF_RADIUS = 5;

        ctx.fillStyle = "#000000";
        const drawPos = this.position.add(offset);
        ctx.fillRect(drawPos.x - DEV_RADIUS, drawPos.y - DEV_RADIUS, DEV_RADIUS * 2, DEV_RADIUS * 2)
        ctx.drawImage(HubImage, drawPos.x - DEV_RADIUS, drawPos.y - DEV_RADIUS, 2 * DEV_RADIUS, 2 * DEV_RADIUS);

        for (const intf of Object.values(this.interfaces)) {
            if (intf.connected_to !== null) {
                const direction = this.position.direction(intf.connected_to.getOwner().position)
                const coeff = 1;
                if (Math.abs(direction.x) > Math.abs(direction.y)) {
                    const tan = direction.y / direction.x;
                    direction.y = direction.x > 0 ? tan : -tan;
                    direction.x = direction.x > 0 ? 1 : -1;
                } else {
                    const tan = direction.x / direction.y;
                    direction.y = direction.y > 0 ? 1 : -1;
                    direction.x = direction.y > 0 ? tan : -tan;
                }

                const intfPos = drawPos.add(direction.mul(coeff).mul(DEV_RADIUS + INTF_RADIUS))

                ctx.fillStyle = "#00ff00";
                ctx.beginPath();
                ctx.arc(intfPos.x, intfPos.y, INTF_RADIUS, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }

    tick(): void {
    }

    reset(): void {
    }
}
