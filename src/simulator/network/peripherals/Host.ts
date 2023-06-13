import { Network } from "../Network";
import { Device } from "./Device";
import { Interface } from "./Interface";

export class Host extends Device {
    mac: string;

    constructor(network: Network, name: string, mac: string) {
        super(network, name)
        this.addInterface("eth0");
        this.mac = mac;
    }

    onPacketReceived(iface: Interface, data: any): void {
    }

    getMac(): string {
        return this.mac;
    }

    tick(): void {
    }
}
