import { Network } from "../Network";
import { Device } from "./Device";
import { Interface } from "./Interface";

export class Hub extends Device {
    mac: string;

    constructor(network: Network, name: string, mac: string, ports: number) {
        super(network, name)
        for(let i = 0; i < ports; i++)
            this.addInterface("eth" + i);
        this.mac = mac;
    }

    onPacketReceived(iface: Interface, data: any): void {
        for(const intf of Object.values(this.interfaces)) {
            if (intf !== iface)
                intf.send(data);
        }
    }

    tick(): void {
    }
}