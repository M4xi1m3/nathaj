import SwitchImg from '../../../assets/switch.png';
import { Vector2D } from '../../drawing/Vector2D';
import { Network } from '../Network';
import { Ethernet } from '../packets/definitions/Ethernet';
import { Hub } from './Hub';
import { Interface } from './Interface';

const SwitchImage = new Image();
SwitchImage.src = SwitchImg;

/**
 * Basic learning switch
 *
 * A learning switch is a more evolved version of a hub
 * Instead of forwarding to all interfaces, it learns
 * the relation between mac address and interface to
 * only send the packet to the right interface
 */
export class Switch extends Hub {
    /**
     * Dictionary storing the relations between mac addresses and interfaces
     */
    protected mac_address_table: { [mac: string]: string };

    /**
     * Mac address of the switch
     */
    private mac: string;

    /**
     * Create a switch
     *
     * @param {Network} network Network to put the switch in
     * @param {string} name Name of the switch
     * @param {string} mac MAC address of the switch
     * @param {number} ports Number of interfaces to create
     */
    constructor(network: Network, name: string, mac: string, ports: number) {
        super(network, name, ports);
        this.mac_address_table = {};
        this.mac = mac.toLowerCase();
    }

    /**
     * Get the MAC address of the switch
     *
     * @returns {string} MAC address of the switch
     */
    public getMac(): string {
        return this.mac;
    }

    onPacketReceived(iface: Interface, data: ArrayBuffer): void {
        const packet = new Ethernet(data);

        this.mac_address_table[packet.src] = iface.getName();
        if (packet.dst in this.mac_address_table) {
            this.getInterface(this.mac_address_table[packet.dst]).send(data);
        } else {
            this.getInterfaces()
                .filter((intf) => intf !== iface)
                .forEach((intf) => intf.send(data));
        }
    }

    draw(ctx: CanvasRenderingContext2D, offset: Vector2D): void {
        this.drawSquareImage(ctx, this.getPosition().add(offset), SwitchImage, 12);
        this.drawInterfaces(ctx, this.getPosition().add(offset), 12, this.getInterfaces(), this.intfPositionSquare);
    }

    reset(): void {
        super.reset();
        this.mac_address_table = {};
    }
}
