
import { PacketEventData } from '../Network';
import { Device } from './Device';

export type ReceivedPacketEventData = {
    packet: ArrayBuffer
}

export class InterfaceException extends Error {
    iface: Interface;

    constructor(description: string, iface: Interface) {
        super(description);
        this.iface = iface;
    }
}

export class AlreadyConnectedException extends InterfaceException {
    constructor(iface: Interface) {
        super("Interface " + iface.getFullName() + " is already connected.", iface);
    }
}

export class NotInSameNetworkException extends InterfaceException {
    constructor(iface: Interface, other: Interface) {
        super("Interface " + iface.getFullName() + " and " + other.getFullName() + " are not in the same network.", iface);
    }
}

export class NotConnectedException extends InterfaceException {
    constructor(iface: Interface) {
        super("Interface " + iface.getFullName() + " is not connected.", iface);
    }
}

export class Interface extends EventTarget {
    name: string;
    owner: Device;
    connected_to: Interface | null;

    receive_queue: ArrayBuffer[];

    constructor(owner: Device, name: string) {
        super();
        this.owner = owner;
        this.name = name;
        this.connected_to = null;
        this.receive_queue = [];
    }

    getOwner(): Device {
        return this.owner
    }

    getFullName(): string {
        return this.getOwner().getName() + "-" + this.getName();
    }

    getName(): string {
        return this.name
    }

    connect(other: Interface): void {
        if (this.connected_to !== null)
            throw new AlreadyConnectedException(this);
        if (other.connected_to !== null)
            throw new AlreadyConnectedException(other);

        if (this.getOwner().getNetwork() !== other.getOwner().getNetwork())
            throw new NotInSameNetworkException(this, other);

        this.connected_to = other;
        other.connected_to = this;
    }

    disconnect(): void {
        if (this.connected_to === null)
            throw new NotConnectedException(this);

        this.connected_to.connected_to = null;
        this.connected_to = null;
    }

    tick(): void {
        const packet = this.receive_queue.pop();

        if (packet === undefined)
            return;

        this.getOwner().getNetwork().dispatchEvent(new CustomEvent<PacketEventData>('packet', {
            detail: {
                time: this.getOwner().getNetwork().time(),
                packet,
                interface: this,
                direction: 'ingoing'
            }
        }));

        this.dispatchEvent(new CustomEvent<ReceivedPacketEventData>('receivedata', {
            detail: {
                packet
            }
        }));
    }

    send(data: ArrayBuffer): void {
        if (this.connected_to === null)
            return;

        this.getOwner().getNetwork().dispatchEvent(new CustomEvent<PacketEventData>('packet', {
            detail: {
                time: this.getOwner().getNetwork().time(),
                packet: data,
                interface: this,
                direction: 'outgoing'
            }
        }));

        this.connected_to.receive_queue.push(data)
    }

    toString(): string {
        return "<Interface " + this.owner.getName() + "-" + this.getName() + ">";
    }
}
