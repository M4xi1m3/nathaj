import SwitchImg from '../../../assets/switch.png';
import { Vector2D } from '../../drawing/Vector2D';
import { MACable } from '../mixins/MACable';
import { applyMixins } from '../mixins/Mixins';
import { Network } from '../Network';
import { Ethernet } from '../packets/definitions/Ethernet';
import { isSavedDevice, SavedDevice } from './Device';
import { Hub } from './Hub';
import { Interface, SavedInterface } from './Interface';

const SwitchImage = new Image();
SwitchImage.src = SwitchImg;

export interface SavedSwitch<T extends SavedInterface = SavedInterface> extends SavedDevice<T> {
    mac: string;
}

export function isSavedSwitch(arg: any): arg is SavedSwitch {
    return arg && arg.mac && typeof arg.mac === 'string' && isSavedDevice(arg) && arg.type === 'switch';
}

export interface Switch<T extends Interface = Interface> extends Hub<T>, MACable<T> {}

/**
 * Basic learning switch
 *
 * A learning switch is a more evolved version of a hub
 * Instead of forwarding to all interfaces, it learns
 * the relation between mac address and interface to
 * only send the packet to the right interface
 */
export class Switch<T extends Interface = Interface> extends Hub<T> {
    /**
     * Dictionary storing the relations between mac addresses and interfaces
     */
    protected mac_address_table: { [mac: string]: string };

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
        this.setMac(mac.toLowerCase());
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

    public save(): SavedSwitch {
        return {
            type: 'switch',
            mac: this.getMac(),
            name: this.getName(),
            interfaces: this.getInterfaces().map((intf) => intf.save()),
            x: this.getPosition().x,
            y: this.getPosition().y,
        };
    }

    /**
     * Load a switch from an object
     *
     * @param {Network} net Network to load into
     * @param {SavedSwitch} data Data to load from
     */
    public static load(net: Network, data: SavedSwitch) {
        const host = new Switch(net, data.name, data.mac, 0);
        host.removeAllInterfaces();
        host.setPosition(new Vector2D(data.x, data.y));
        data.interfaces.forEach((intf) => {
            host.addInterface(intf.name);
        });
    }
}

applyMixins(Switch, [MACable]);
