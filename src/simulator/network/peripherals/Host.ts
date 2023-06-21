import { Vector2D } from '../../drawing/Vector2D';
import { Network } from '../Network';
import { Device, isSavedDevice, SavedDevice } from './Device';
import { Interface } from './Interface';

export interface SavedHost extends SavedDevice {
    mac: string;
}

export function isSavedHost(arg: any): arg is SavedHost {
    return arg && arg.mac && typeof arg.mac === 'string' && isSavedDevice(arg) && arg.type === 'host';
}

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
        super(network, name);
        this.addInterface('eth0');
        this.mac = mac.toLowerCase();
    }

    public onPacketReceived(iface: Interface, data: ArrayBuffer): void {
        iface;
        data;
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
        //
    }

    public reset(): void {
        //
    }

    /**
     * Save a host to an object
     *
     * @returns {SavedHost} Saved host
     */
    public save(): SavedHost {
        return {
            type: 'host',
            mac: this.getMac(),
            name: this.getName(),
            interfaces: this.getInterfaces().map((intf) => intf.save()),
            x: this.getPosition().x,
            y: this.getPosition().y,
        };
    }

    /**
     * Load an host from an object
     *
     * @param {Network} net Network to load into
     * @param {SavedHost} data Data to load from
     */
    public static load(net: Network, data: SavedHost) {
        const host = new Host(net, data.name, data.mac);
        host.removeAllInterfaces();
        host.setPosition(new Vector2D(data.x, data.y));
        data.interfaces.forEach((intf) => {
            host.addInterface(intf.name);
        });
    }
}
