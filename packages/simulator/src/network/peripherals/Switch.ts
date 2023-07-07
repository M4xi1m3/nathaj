import { Vector2D } from '../../drawing/Vector2D';
import { Network } from '../Network';
import { Ethernet } from '../packets/definitions/Ethernet';
import { isSavedDevice, SavedDevice } from './Device';
import { Hub } from './Hub';
import { Interface } from './Interface';

export function isSavedSwitch(arg: any): arg is SavedDevice {
    return arg && isSavedDevice(arg) && arg.type === 'switch';
}

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
     * @param {number} ports Number of interfaces to create
     * @param {string} base_mac MAC address of the switch
     */
    constructor(network: Network, name: string, base_mac?: string, ports?: number) {
        if (name === undefined) name = Switch.getNextAvailableName(network);
        if (base_mac === undefined) base_mac = Switch.getNextAvailableMac(network);
        if (ports === undefined) ports = 4;

        super(network, name, base_mac, ports);
        this.mac_address_table = {};
    }

    onPacketReceived(iface: Interface, data: ArrayBuffer): void {
        const packet = new Ethernet(data);

        if (this.mac_address_table[packet.src] !== iface.getName()) {
            this.mac_address_table[packet.src] = iface.getName();
            this.changed();
        }

        if (packet.dst in this.mac_address_table) {
            this.getInterface(this.mac_address_table[packet.dst]).send(data);
        } else {
            this.getInterfaces()
                .filter((intf) => intf !== iface)
                .forEach((intf) => intf.send(data));
        }
    }

    reset(): void {
        super.reset();
        this.mac_address_table = {};
    }

    /**
     * Get the mac address table as an array of mac <> interface association
     *
     * @returns Mac address table
     */
    getMacAddressTable(): [string, string][] {
        return Object.entries(this.mac_address_table);
    }

    /**
     * Clear the mac address table
     */
    clearMacAddressTable() {
        this.mac_address_table = {};
        this.changed();
    }

    public save(): SavedDevice {
        return {
            type: 'switch',
            name: this.getName(),
            interfaces: this.getInterfaces().map((intf) => intf.save()),
            x: this.getPosition().x,
            y: this.getPosition().y,
        };
    }

    public getType(): string {
        return 'Switch';
    }

    /**
     * Load a switch from an object
     *
     * @param {Network} net Network to load into
     * @param {SavedSwitch} data Data to load from
     */
    public static load(net: Network, data: SavedDevice) {
        const host = new Switch(net, data.name);
        host.removeAllInterfaces();
        host.setPosition(new Vector2D(data.x, data.y));
        data.interfaces.forEach((intf) => {
            host.addInterface(intf.name, intf.mac);
        });
    }

    public static getDevNamePrefix(): string {
        return 'sw';
    }

    public static getDevMacPrefix(): string {
        return '03';
    }
}
