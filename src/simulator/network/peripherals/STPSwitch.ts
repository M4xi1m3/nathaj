import { Vector2D } from "../../drawing/Vector2D";
import { Network } from "../Network";
import { Ethernet } from "../packets/definitions/Ethernet";
import { Hub } from "./Hub";
import { Interface } from "./Interface";
import STPSwitchImg from '../../../assets/stp-switch.png';

const STPSwitchImage = new Image()
STPSwitchImage.src = STPSwitchImg

export class STPSwitch extends Hub {
    mac_address_table: { [mac: string]: string };

    constructor(network: Network, name: string, mac: string, ports: number) {
        super(network, name, mac, ports);
        this.mac_address_table = {};
    }

    onPacketReceived(iface: Interface, data: ArrayBuffer): void {
        const packet = new Ethernet(data);

        this.mac_address_table[packet.src] = iface.name;
        if (packet.dst in this.mac_address_table) {
            this.getInterface(this.mac_address_table[packet.dst]).send(data);
        } else {
            for (const intf of Object.values(this.interfaces)) {
                if (intf !== iface)
                    intf.send(data);
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, offset: Vector2D): void {
        const DEV_RADIUS = 12;
        const INTF_RADIUS = 5;

        ctx.fillStyle = "#000000";
        const drawPos = this.position.add(offset);
        ctx.fillRect(drawPos.x - DEV_RADIUS, drawPos.y - DEV_RADIUS, DEV_RADIUS * 2, DEV_RADIUS * 2)
        ctx.drawImage(STPSwitchImage, drawPos.x - DEV_RADIUS, drawPos.y - DEV_RADIUS, 2 * DEV_RADIUS, 2 * DEV_RADIUS);

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
