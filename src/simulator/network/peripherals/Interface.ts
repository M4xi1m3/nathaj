import { PacketEventData } from '../Network';
import { Device } from './Device';

/**
 * Data of the packet received event
 */
export type ReceivedPacketEventData = {
    packet: ArrayBuffer;
};

/**
 * Excpetion thrown for an error related to an interface
 */
export class InterfaceException extends Error {
    iface: Interface;

    constructor(description: string, iface: Interface) {
        super(description);
        this.iface = iface;
    }
}

/**
 * Eception thrown when tyring to connect an interface to itself
 */
export class ConnectionToItselfException extends InterfaceException {
    constructor(iface: Interface) {
        super('Tying to connect interface ' + iface.getFullName() + ' to itself.', iface);
    }
}

/**
 * Eception thrown when tyring to connect an interface that is already connected
 */
export class AlreadyConnectedException extends InterfaceException {
    constructor(iface: Interface) {
        super('Interface ' + iface.getFullName() + ' is already connected.', iface);
    }
}

/**
 * Exception thrown when trying to connect an interface that is in another network
 */
export class NotInSameNetworkException extends InterfaceException {
    constructor(iface: Interface, other: Interface) {
        super(
            'Interface ' + iface.getFullName() + ' and ' + other.getFullName() + ' are not in the same network.',
            iface
        );
    }
}

/**
 * Exception thrown when the interface isn't connected
 */
export class NotConnectedException extends InterfaceException {
    constructor(iface: Interface) {
        super('Interface ' + iface.getFullName() + ' is not connected.', iface);
    }
}

/**
 * Exception thrown when the interface isn't connected to a device
 */
export class DisconnectedException extends InterfaceException {
    constructor(iface: Interface) {
        super('Interface is disconnected.', iface);
    }
}

export interface SavedInterface {
    name: string;
    connected_to?: {
        device: string;
        interface: string;
    };
}

export function isSavedInterface(arg: any): arg is SavedInterface {
    return (
        arg &&
        arg.name &&
        typeof arg.name === 'string' &&
        (arg.connected_to
            ? typeof arg.connected_to === 'object' &&
              arg.connected_to.device &&
              typeof arg.connected_to.device === 'string' &&
              arg.connected_to.interface &&
              typeof arg.connected_to.interface === 'string'
            : true)
    );
}

/**
 * Network interface, which can send and receive packets
 */
export class Interface<T extends Device = Device<any>> extends EventTarget {
    /**
     * Name of the interface
     */
    private name: string;

    /**
     * Device that owns the interface
     */
    private owner?: T;

    /**
     * Interface to which the interface is connected
     */
    private connected_to: Interface | null;

    /**
     * Receive queue of the interface
     */
    private receive_queue: ArrayBuffer[];

    /**
     * Create the interface
     *
     * @param {Device} owner Owner of the interface
     * @param {string} name Name of the interface
     */
    constructor(owner: T, name: string) {
        super();
        this.owner = owner;
        this.name = name;
        this.connected_to = null;
        this.receive_queue = [];
    }

    /**
     * Get the owner of the interface
     *
     * @returns {Device} owner of the interface
     */
    getOwner(): T {
        if (this.owner === undefined) throw new DisconnectedException(this);

        return this.owner;
    }

    /**
     * Get the full name of the interface
     *
     * @returns {string} Full name of the interface
     */
    getFullName(): string {
        return this.getOwner().getName() + '-' + this.getName();
    }

    /**
     * Get the name of the interface
     *
     * @returns {string} Name of the interface
     */
    getName(): string {
        return this.name;
    }

    /**
     * Get the interface to which the interface is connected to
     *
     * @returns {Interface | null} Interface to which the interface is connected to or null if not connected
     */
    getConnection(): Interface | null {
        return this.connected_to;
    }

    /**
     * Check if the interface is connected
     *
     * @returns {boolean} True if the interface is connected, false otherwise
     */
    isConnected(): boolean {
        return this.connected_to !== null;
    }

    /**
     * Connect the interface to another interface
     *
     * @param {Interface} other Interface to connect to
     */
    connect(other: Interface): void {
        if (this === other) throw new ConnectionToItselfException(this);
        if (this.connected_to !== null) throw new AlreadyConnectedException(this);
        if (other.connected_to !== null) throw new AlreadyConnectedException(other);

        if (this.getOwner().getNetwork() !== other.getOwner().getNetwork())
            throw new NotInSameNetworkException(this, other);

        this.connected_to = other;
        other.connected_to = this;

        this.getOwner().dispatchEvent(new Event('changed'));
        other.getOwner().dispatchEvent(new Event('changed'));
    }

    /**
     * Disconnect the interface
     */
    disconnect(): void {
        if (this.connected_to === null) throw new NotConnectedException(this);

        const other = this.connected_to;

        this.connected_to.connected_to = null;
        this.connected_to = null;

        this.getOwner().dispatchEvent(new Event('changed'));
        other.getOwner().dispatchEvent(new Event('changed'));
    }

    /**
     * Process the receive queue
     */
    tick(): void {
        const packet = this.receive_queue.pop();

        if (packet === undefined) return;

        this.getOwner()
            .getNetwork()
            .dispatchEvent(
                new CustomEvent<PacketEventData>('packet', {
                    detail: {
                        time: this.getOwner().getNetwork().time(),
                        packet,
                        interface: this,
                        direction: 'ingoing',
                    },
                })
            );

        this.dispatchEvent(
            new CustomEvent<ReceivedPacketEventData>('receivedata', {
                detail: {
                    packet,
                },
            })
        );
    }

    /**
     * Send a packet to the connected interface
     *
     * Internally, this puts the packet in the other interface's receive queue.
     * It will be processes at the next tick.
     *
     * @param {ArrayBuffer} data Packet to send
     */
    send(data: ArrayBuffer): void {
        if (this.connected_to === null) return;

        this.getOwner()
            .getNetwork()
            .dispatchEvent(
                new CustomEvent<PacketEventData>('packet', {
                    detail: {
                        time: this.getOwner().getNetwork().time(),
                        packet: data,
                        interface: this,
                        direction: 'outgoing',
                    },
                })
            );

        this.connected_to.receive_queue.push(data);
    }

    /**
     * Get a string representation of the interface
     *
     * @returns {string} String representation of the interface
     */
    toString(): string {
        return '<Interface ' + this.getOwner().getName() + '-' + this.getName() + '>';
    }

    public save(): SavedInterface {
        return {
            name: this.getName(),
            ...(this.isConnected()
                ? {
                      connected_to: {
                          device: this.getConnection()?.getOwner().getName() ?? '',
                          interface: this.getConnection()?.getName() ?? '',
                      },
                  }
                : {}),
        };
    }
}
