import { Vector2D } from '../../drawing/Vector2D';
import { Mac } from '../../utils/Mac';
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
    constructor(network: Network, name?: string, mac?: string) {
        if (name === undefined) name = Host.getNextAvailableName(network);
        if (mac === undefined) mac = Mac.random();

        super(network, name);
        this.addInterface('eth0', mac);
        this.LLCTestTimer = null;
        this.expectingLLCFrom = null;
    }

    private LLCTestTimer: number | null = null;
    private expectingLLCFrom: string | null = null;

    public sendLLCTest(mac: string, iface: string, reply = false) {
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
                control: reply ? 0xf3 : 0xe3,
            })
        );

        if (!reply) {
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
                if (llc.ssap === 0 && llc.dsap === 0) {
                    if (llc.control === 0xe3) {
                        // We received a LLC TEST request, reply
                        this.sendLLCTest(p.src, iface.getName(), true);
                    } else if (llc.control === 0xf3) {
                        // We received a LLC TEST reply
                        if (this.LLCTestTimer !== null && p.src === this.expectingLLCFrom) {
                            // We were axpecting a reply, trigger the event.
                            this.LLCTestTimer = null;
                            this.expectingLLCFrom = null;
                            this.dispatchEvent(new Event('llc_test_success'));
                        }
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
        this.LLCTestTimer = null;
        this.expectingLLCFrom = null;
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

    public static getDevMacPrefix(): string {
        return '01';
    }
}
