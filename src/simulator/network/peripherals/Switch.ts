import { Vector2D } from "../../drawing/Vector2D";
import { Network } from "../Network";
import { Ethernet } from "../packets/definitions/Ethernet";
import { Hub } from "./Hub";
import { Interface } from "./Interface";
import SwitchImg from '../../../assets/switch.png';

const SwitchImage = new Image()
SwitchImage.src = SwitchImg

export class Switch extends Hub {
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
        this.drawSquareImage(ctx, this.position.add(offset), SwitchImage, 12);
        this.drawInterfaces(ctx, this.position.add(offset), 12, Object.values(this.interfaces), this.intfPositionSquare);
    }

    tick(): void {
    }

    reset(): void {
        super.reset()
        this.mac_address_table = {};
    }
}
