import { Vector2D } from '../../drawing/Vector2D';
import { Network } from '../Network';
import { Device, isSavedDevice, SavedDevice } from './Device';
import { Interface } from './Interface';

export function isSavedHost(arg: any): arg is SavedDevice {
    return arg && isSavedDevice(arg) && arg.type === 'host';
}

/**
 * Represents an host with a single interface in the network
 */
export class Host extends Device {
    /**
     * Create the host
     *
     * @param {Network} network Network of the host
     * @param {string} name Name of the host
     * @param {string} mac Mac address of the host
     */
    constructor(network: Network, name: string, mac?: string) {
        super(network, name);
        if (mac !== undefined) this.addInterface('eth0', mac);
    }

    public onPacketReceived(iface: Interface, data: ArrayBuffer): void {
        iface;
        data;
    }

    public tick(): void {
        //
    }

    public reset(): void {
        //
    }

    public getType(): string {
        return 'Host';
    }

    /**
     * Save a host to an object
     *
     * @returns {SavedHost} Saved host
     */
    public save(): SavedDevice {
        return {
            type: 'host',
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
     * @param {SavedDevice} data Data to load from
     */
    public static load(net: Network, data: SavedDevice) {
        const host = new Host(net, data.name);
        host.removeAllInterfaces();
        host.setPosition(new Vector2D(data.x, data.y));
        data.interfaces.forEach((intf) => {
            host.addInterface(intf.name, intf.mac);
        });
    }

    public static getDevNamePrefix(): string {
        return 'h';
    }
}
