import { Network } from "../Network";
import { Device } from "./Device";
import { Interface } from "./Interface";

/**
 * Represents an host with a single interface in the network
 */
export class Host extends Device {
    /**
     * MAC address of the host
     */
    private mac: string;

    /**
     * Create the host
     * 
     * @param {Network} network Network of the host
     * @param {string} name Name of the host
     * @param {string} mac Mac address of the host
     */
    constructor(network: Network, name: string, mac: string) {
        super(network, name)
        this.addInterface("eth0");
        this.mac = mac;
    }

    public onPacketReceived(iface: Interface, data: ArrayBuffer): void {
    }

    /**
     * Get the MAC address of the host
     *
     * @returns {string} MAC address of the host
     */
    public getMac(): string {
        return this.mac;
    }

    public tick(): void {
    }

    public reset(): void {
    }
}
