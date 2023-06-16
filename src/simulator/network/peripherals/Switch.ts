import { Network } from "../Network";
import { Ethernet } from "../packets/definitions/Ethernet";
import { Device } from "./Device";
import { Hub } from "./Hub";
import { Interface } from "./Interface";

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

    tick(): void {
    }

    reset(): void {
    }
}
