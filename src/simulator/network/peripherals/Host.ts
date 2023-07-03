import { Vector2D } from '../../drawing/Vector2D';
import { Network } from '../Network';
import { Dot3 } from '../packets/definitions/Dot3';
import { Ethernet } from '../packets/definitions/Ethernet';
import { LLC } from '../packets/definitions/LLC';
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

    private LLCTestTimer: number | null = null;
    private expectingLLCFrom: string | null = null;

    public sendLLCTest(mac: string, iface: string, expect_reply = true) {
        if (this.LLCTestTimer !== null) {
            this.dispatchEvent(new Event('llc_test_running'));
            return;
        }

        const intf = this.getInterface(iface);

        const packet = new Dot3({
            src: intf.getMac(),
            dst: mac,
        });

        packet.setNext(
            new LLC({
                ssap: 0,
                dsap: 0,
                control: 0xe3,
            })
        );

        if (expect_reply) {
            this.LLCTestTimer = this.getNetwork().time() + 5;
            this.expectingLLCFrom = mac;
        }

        intf.send(packet.raw());
        this.dispatchEvent(new Event('llc_test_sent'));
    }

    public onPacketReceived(iface: Interface, data: ArrayBuffer): void {
        const p = Ethernet.ethernet(data);
        if (this.isDeviceMac(p.dst) && p instanceof Dot3) {
            const llc = p.getNext();
            if (llc instanceof LLC) {
                if (llc.ssap === 0 && llc.dsap === 0 && llc.control === 0xe3) {
                    if (p.src === this.expectingLLCFrom) {
                        // We are expecting a LLC TEST from that address, don't reply.
                        this.LLCTestTimer = null;
                        this.expectingLLCFrom = null;
                        this.dispatchEvent(new Event('llc_test_success'));
                    } else {
                        // We are not expecting a LLC TEST from that address, reply.
                        this.sendLLCTest(p.src, iface.getName(), false);
                    }
                }
            }
        }
    }

    public tick(): void {
        if (this.LLCTestTimer !== null && this.getNetwork().time() > this.LLCTestTimer) {
            this.LLCTestTimer = null;
            this.expectingLLCFrom = null;
            this.dispatchEvent(new Event('llc_test_timeout'));
        }
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
