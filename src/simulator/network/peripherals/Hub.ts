import HubImg from '../../../assets/hub.png';
import { Vector2D } from '../../drawing/Vector2D';
import { Network } from '../Network';
import { Device, isSavedDevice, SavedDevice } from './Device';
import { Interface } from './Interface';

const HubImage = new Image();
HubImage.src = HubImg;

export function isSavedHub(arg: any): arg is SavedDevice {
    return arg && isSavedDevice(arg) && arg.type === 'hub';
}

/**
 * Simple ethernet hub
 *
 * Upon receiving a packet on one of its interface, a hub
 * re-transmits it, untouched, on all of its other interfaces
 */
export class Hub<T extends Interface = Interface> extends Device<T> {
    constructor(network: Network, name: string, ports: number) {
        super(network, name);
        for (let i = 0; i < ports; i++) this.addInterface('eth' + i);
    }

    onPacketReceived(iface: Interface, data: ArrayBuffer): void {
        this.getInterfaces()
            .filter((intf) => intf !== iface)
            .forEach((intf) => intf.send(data));
    }

    collision(other: Vector2D): boolean {
        return this.getPosition().sqdist(other) < 12 * 12;
    }

    draw(ctx: CanvasRenderingContext2D, offset: Vector2D): void {
        this.drawSquareImage(ctx, this.getPosition().add(offset), HubImage, 12);
        this.drawInterfaces(ctx, this.getPosition().add(offset), 12, this.getInterfaces(), this.intfPositionSquare);
    }

    tick(): void {
        //
    }

    reset(): void {
        //
    }

    /**
     * Save a hub to an object
     *
     * @returns {SavedDevice} Saved hub
     */
    public save(): SavedDevice {
        return {
            type: 'hub',
            name: this.getName(),
            interfaces: this.getInterfaces().map((intf) => intf.save()),
            x: this.getPosition().x,
            y: this.getPosition().y,
        };
    }

    /**
     * Load a hub from an object
     *
     * @param {Network} net Network to load into
     * @param {SavedDevice} data Data to load from
     */
    public static load(net: Network, data: SavedDevice) {
        const host = new Hub(net, data.name, 0);
        host.removeAllInterfaces();
        host.setPosition(new Vector2D(data.x, data.y));
        data.interfaces.forEach((intf) => {
            host.addInterface(intf.name);
        });
    }
}
