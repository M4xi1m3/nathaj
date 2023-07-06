import STPSwitchImg from '../../../assets/stp-switch.png';
import { Vector2D } from '../../drawing/Vector2D';
import { Mac } from '../../utils/Mac';
import { Network } from '../Network';
import { BPDU as BPDUPacket } from '../packets/definitions/BPDU';
import { Dot3 } from '../packets/definitions/Dot3';
import { Ethernet } from '../packets/definitions/Ethernet';
import { LLC } from '../packets/definitions/LLC';
import { isSavedDevice, SavedDevice } from './Device';
import { Interface, isSavedInterface, SavedInterface } from './Interface';
import { Switch } from './Switch';

const STPSwitchImage = new Image();
STPSwitchImage.src = STPSwitchImg;

export interface SavedSTPSwitch extends SavedDevice<SavedSTPInterface> {
    priority: number;
}

export function isSavedSTPSwitch(arg: any): arg is SavedSTPSwitch {
    return (
        arg &&
        arg.priority !== undefined &&
        typeof arg.priority === 'number' &&
        isSavedDevice(arg) &&
        arg.type === 'stp-switch'
    );
}

export interface SavedSTPInterface extends SavedInterface {
    disabled: boolean;
    cost: number;
}

export function isSavedSTPInterface(arg: any): arg is SavedSTPInterface {
    return (
        arg &&
        arg.disabled !== undefined &&
        typeof arg.disabled === 'boolean' &&
        arg.cost !== undefined &&
        typeof arg.cost === 'number' &&
        isSavedInterface(arg)
    );
}

/**
 * State of the ports
 */
export enum PortState {
    Blocking = 0,
    Listening = 1,
    Learning = 2,
    Forwarding = 3,
    Disabled = 4,
}

/**
 * Roles of the ports
 */
export enum PortRole {
    Root = 0,
    Designated = 1,
    Blocking = 2,
    Disabled = 3,
}

/**
 * Bridge identifier
 *
 * @internal
 */
class Identifier {
    /**
     * Bridge priority
     */
    priority: number;

    /**
     * Bridge mac address
     */
    mac: string;

    /**
     * Create an identifier
     *
     * @param {number} priority Bridge priority
     * @param {string} mac Bridge mac address
     */
    constructor(priority: number, mac: string) {
        this.priority = priority;
        this.mac = mac;
    }

    /**
     * Convert the identifier to a 64 bit number
     *
     * @returns {number} Number corresponding to the identifier
     */
    toNumber(): bigint {
        let mac = 0n;
        this.mac.split(':').forEach((v: string) => {
            mac <<= 8n;
            mac |= BigInt(parseInt(v, 16) & 0xff);
        });
        return (BigInt(this.priority) << 48n) | mac;
    }

    /**
     * Check equality between two identifiers
     *
     * @param {Identifier} other Identifier to check against
     * @returns {boolean} True if the identifier are equal, false otherwise
     */
    eq(other: Identifier) {
        return this.toNumber() === other.toNumber();
    }
}

/**
 * Bridge Protocol Data Unit class
 *
 * @internal
 */
class BPDU {
    /**
     * Identifier of the root
     */
    root_id: Identifier;

    /**
     * Cost of the path to the root
     */
    root_cost: number;

    /**
     * Identifier of the bridge
     */
    bridge_id: Identifier;

    /**
     * Identifier of the port
     */
    port_id: number;

    /**
     * Create a BPDU
     *
     * @param {Identifier} root_id ID of the root
     * @param {number} root_cost Cost to the root
     * @param {Identifier} bridge_id ID of the bridge
     * @param {number} port_id ID of the port
     */
    constructor(root_id: Identifier, root_cost: number, bridge_id: Identifier, port_id: number) {
        this.root_id = root_id;
        this.root_cost = root_cost;
        this.bridge_id = bridge_id;
        this.port_id = port_id;
    }

    /**
     * Convert a BPDU packet to a BPDU
     *
     * @param {BPDUPacket} packet Packet to convert from
     * @returns {BPDU} The extracted BPDU
     */
    static fromPacket(packet: BPDUPacket): BPDU {
        return new BPDU(
            new Identifier(packet.root_priority, packet.root_mac),
            packet.root_cost,
            new Identifier(packet.bridge_priority, packet.bridge_mac),
            packet.bridge_port
        );
    }

    /**
     * Convert the BPDU to a packet
     *
     * @param {string} mac IEEE 802.3 packet's source address
     * @returns {Dot3} IEEE 802.3 packet containing the BPDU
     */
    toPacket(mac: string): Dot3 {
        const ether = new Dot3({
            dst: '01:81:c2:00:00:00',
            src: mac,
        });
        ether
            .setNext(
                new LLC({
                    dsap: 0x42,
                    ssap: 0x42,
                    control: 3,
                })
            )
            .setNext(
                new BPDUPacket({
                    protocol_identifier: 0,
                    protocol_version: 0,
                    bpdu_type: 0,
                    bpdu_flags: 0,
                    root_priority: this.root_id.priority,
                    root_mac: this.root_id.mac,
                    root_cost: this.root_cost,
                    bridge_priority: this.bridge_id.priority,
                    bridge_mac: this.bridge_id.mac,
                    bridge_port: this.port_id,
                    message_age: 0,
                    max_age: 20 * 256,
                    hello_time: 2 * 256,
                    forward_delay: 15 * 256,
                })
            );
        return ether;
    }

    /**
     * Compare the BPDU with another bpdu
     * @param {BPDU} other BPDU to compare against
     * @returns {boolean} True if this bpdu is better than the other
     */
    lt(other: BPDU): boolean {
        if (this.root_id.toNumber() !== other.root_id.toNumber())
            return this.root_id.toNumber() < other.root_id.toNumber();
        if (this.root_cost !== other.root_cost) return this.root_cost < other.root_cost;
        if (this.bridge_id.toNumber() !== other.bridge_id.toNumber())
            return this.bridge_id.toNumber() < other.bridge_id.toNumber();
        if (this.port_id !== other.port_id) return this.port_id < other.port_id;
        return false;
    }

    /**
     * Check for equality with another BPDU
     *
     * @param {BPDU} other BPDU to check for equality
     * @returns {boolean} True if the BPDUs are equal, false otherwise
     */
    eq(other: BPDU): boolean {
        return (
            this.root_id.toNumber() === other.root_id.toNumber() &&
            this.root_cost === other.root_cost &&
            this.bridge_id.toNumber() === other.bridge_id.toNumber() &&
            this.port_id === other.port_id
        );
    }

    /**
     * Get the best BPDU
     *
     * @param {BPDU} other BPDU to compare against
     * @returns {BPDU} Best BPDU
     */
    winner(other: BPDU) {
        return this.lt(other) ? this : other;
    }
}

/**
 * Interface with STP support
 */
export class STPInterface extends Interface<STPSwitch> {
    /**
     * ID of the port
     */
    id = 0;

    /**
     * Cost of traveling trough the port
     */
    path_cost = 0;

    /**
     * State of the port
     */
    state: PortState = PortState.Blocking;

    /**
     * Role of the port
     */
    role: PortRole = PortRole.Designated;

    /**
     * Best BPDU received by the port
     */
    bpdu: BPDU = new BPDU(new Identifier(0, '00:00:00:00:00:00'), 0, new Identifier(0, '00:00:00:00:00:00'), 0);

    /**
     * Expiry timestamp of the port's hold timer
     */
    hold_timer_expiry = 0;

    /**
     * Expiry timestamp of the port's message age timer
     */
    message_age_expiry = 0;

    /**
     * Expiry timestamp of the port's forward timer
     */
    forward_delay_expiry = 0;

    /**
     * Initialize the port's data
     */
    initialize(id: number, path_cost: number, disabled = false) {
        this.id = id;
        this.path_cost = path_cost;

        if (disabled) {
            this.state = PortState.Disabled;
            this.role = PortRole.Disabled;
        } else {
            this.state = PortState.Blocking;
            this.role = PortRole.Designated;
        }

        this.bpdu = new BPDU(this.getOwner().identifier, this.path_cost, this.getOwner().identifier, this.id);

        this.hold_timer_expiry = this.getOwner().time() + this.getOwner().hold_time;
        this.message_age_expiry = this.getOwner().time() + this.getOwner().message_age;
        this.forward_delay_expiry = this.getOwner().time() + this.getOwner().forward_delay;
    }

    /**
     * Check if the port can send a BPDU
     *
     * @returns {boolean} True if the port can send BPDUs
     */
    canSend(): boolean {
        if (this.disabled() || this.blocking()) return false;

        if (this.getOwner().time() < this.hold_timer_expiry) return false;

        return true;
    }

    /**
     * Enable the port
     */
    enable() {
        this.initialize(this.id, this.path_cost, false);
        this.getOwner().portAssignation();
        this.getOwner().changed();
    }

    /**
     * Disable the port
     */
    disable() {
        this.makeDesignated();
        this.updateState(PortState.Disabled, PortRole.Disabled);
        this.getOwner().portAssignation();
        this.getOwner().changed();
    }

    /**
     * Check if the port is disabled
     *
     * @returns {boolean} True if the port is disabled, false otherwise
     */
    disabled(): boolean {
        return this.role === PortRole.Disabled;
    }

    /**
     * Check if the port is blocking
     *
     * @returns {boolean} True if the port is blocking, false otherwise
     */
    blocking(): boolean {
        return this.role === PortRole.Blocking;
    }

    /**
     * Update the configuration with the received BPDU
     *
     * @param {BPDU} config Received BPDU
     */
    updateConfig(config: BPDU) {
        this.bpdu = this.bpdu.winner(config);

        this.message_age_expiry = this.getOwner().time() + this.getOwner().message_age;
        this.getOwner().portAssignation();
    }

    /**
     * Advance in the Listening -> Learning -> Forwarding state cycle
     */
    doForward() {
        if (this.getOwner().time() > this.forward_delay_expiry) {
            switch (this.state) {
                case PortState.Listening:
                    this.updateState(PortState.Learning, this.role);
                    break;
                case PortState.Learning:
                    this.updateState(PortState.Forwarding, this.role);
                    break;
            }

            this.forward_delay_expiry = this.getOwner().time() + this.getOwner().forward_delay;
        }
    }

    /**
     * Update the state and role of the port
     *
     * @param {PortState} state New state of the port
     * @param {PortRole} role New role of the port
     */
    updateState(state: PortState, role: PortRole) {
        this.state = state;
        this.role = role;

        this.message_age_expiry = this.getOwner().time() + this.getOwner().message_age;
        this.getOwner().changed();
    }

    /**
     * Make the port blocking
     */
    makeBlocking() {
        if (this.disabled()) return;

        if (this.state === PortState.Blocking && this.role === PortRole.Blocking) return;

        this.updateState(PortState.Blocking, PortRole.Blocking);
    }

    /**
     * Make the port root
     */
    makeRoot() {
        if (this.disabled()) return;

        if (this.state !== PortState.Blocking && this.role === PortRole.Root) return;

        this.updateState(PortState.Listening, PortRole.Root);
    }

    /**
     * Make the port designated
     */
    makeDesignated() {
        if (this.disabled()) return;

        if (this.state !== PortState.Blocking && this.role === PortRole.Designated) return;

        this.updateState(PortState.Listening, PortRole.Designated);
    }

    public save(): SavedSTPInterface {
        return {
            name: this.getName(),
            disabled: this.state === PortState.Disabled,
            cost: this.path_cost,
            mac: this.getMac(),
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

    public setCost(cost: number) {
        this.path_cost = cost;
        this.getOwner().portAssignation();
    }
}

/**
 * Switch implementing the spanninf tree protocol
 *
 * See IEEE 802.1D (1998) section 8 and 9
 */
export class STPSwitch extends Switch<STPInterface> {
    /**
     * Switch identifier
     * @internal
     */
    identifier: Identifier = new Identifier(32768, '00:00:00:00:00:00');

    private hello_timer_expiry = 0;

    hold_time: number;
    message_age: number;
    forward_delay: number;
    hello_time: number;

    /**
     * Create a stp-capable switch
     *
     * @param {Network} network Network to put the switch in
     * @param {string} name Name of the switch
     * @param {number} ports Number of interfaces to create
     * @param {string} base_mac MAC address of the switch
     */
    constructor(network: Network, name: string, base_mac?: string, ports?: number) {
        if (name === undefined) name = STPSwitch.getNextAvailableName(network);
        if (base_mac === undefined) base_mac = STPSwitch.getNextAvailableMac(network);
        if (ports === undefined) ports = 4;

        super(network, name, base_mac, ports);
        this.identifier = new Identifier(32768, this.getBestMac());

        this.message_age = 20;
        this.forward_delay = 15;
        this.hold_time = 1;
        this.hello_time = 2;
        this.initialize();
    }

    private getBestMac() {
        if (this.getInterfaces().length === 0) {
            return '00:00:00:00:00:00';
        } else {
            return Mac.fromInt(
                this.getInterfaces()
                    .map((i) => Mac.toInt(i.getMac()))
                    .reduce((m, e) => (e < m ? e : m))
            );
        }
    }

    public addInterface(name: string, mac: string, disabled = false, cost = 1): STPInterface {
        const intf = this.createInterface(name, mac, STPInterface);

        const i = Math.max(0, ...Object.values(this.getInterfaces()).map((v) => v.id));
        intf.initialize(i, cost, disabled);

        if (this.identifier !== undefined) this.identifier.mac = this.getBestMac();

        return intf;
    }

    public removeInterface(name: string): void {
        super.removeInterface(name);
        this.identifier.mac = this.getBestMac();
    }

    /**
     * Initialize the states
     */
    private initialize() {
        let i = 0;
        this.getInterfaces().forEach((intf) => {
            intf.initialize(i, intf.path_cost, intf.state === PortState.Disabled);
            i++;
        });

        this.hello_timer_expiry = this.time() + this.hello_time;
    }

    /**
     * Get the best stored BPDU
     *
     * @returns {BPDU} Best stored BPDU
     * @internal
     */
    private getBestBPDU(): BPDU {
        let best = this.getInterfaces()[0].bpdu;
        this.getInterfaces().forEach((intf) => {
            best = best.winner(intf.bpdu);
        });
        return best;
    }

    /**
     * Get the root port's data
     *
     * @returns {STPInterface | null} Root's port data, or null if the switch has no root port (ie. is a root switch)
     * @internal
     */
    private getRootPort(): STPInterface | null {
        if (this.getBestBPDU().root_id.eq(this.identifier)) return null;

        let best = this.getInterfaces()[0];

        this.getInterfaces().forEach((intf) => {
            const tmp = best.bpdu.winner(intf.bpdu);
            best = tmp === best.bpdu ? best : intf;
        });
        return best;
    }

    /**
     * Transmit a BPDU to an interface
     *
     * @param {STPInterface} port STPInterface to tramit a BPDU to
     */
    private transmitConfig(port: STPInterface): void {
        if (!port.canSend()) return;

        const best = this.getBestBPDU();
        const bpdu = new BPDU(
            best.root_id,
            best.bridge_id.eq(this.identifier) ? port.path_cost : best.root_cost + port.path_cost,
            this.identifier,
            port.id
        );

        port.send(bpdu.toPacket(port.getMac()).raw());
    }

    /**
     * Transmit a BPDU on all the interfaces
     */
    private broadcastConfig() {
        for (const intf of this.getInterfaces()) {
            this.transmitConfig(intf);
        }

        if (this.time() > this.hello_timer_expiry) {
            this.hello_timer_expiry = this.time() + this.hello_time;
        }
    }

    /**
     * Handle a received BPDU
     *
     * @param {BPDU} bpdu BPDU to handle
     * @param {STPInterface} intf Interface on which the BPDU was received
     * @internal
     */
    private handleBPDU(bpdu: BPDU, port: STPInterface) {
        port.updateConfig(bpdu);
        this.portAssignation();

        const root_port = this.getRootPort();
        if (root_port !== null) {
            if (port.id === root_port.id) {
                this.broadcastConfig();
            }
        }
    }

    /**
     * Calculate port assignations
     */
    portAssignation() {
        const best = this.getBestBPDU();

        for (const port of this.getInterfaces()) {
            if (best.root_id.eq(this.identifier)) {
                const would_be_bpdu = new BPDU(best.root_id, best.root_cost, this.identifier, port.id);

                if (would_be_bpdu.lt(port.bpdu) || would_be_bpdu.eq(port.bpdu)) {
                    port.makeDesignated();
                } else {
                    port.makeBlocking();
                }
            } else if (best.eq(port.bpdu)) {
                port.makeRoot();
            } else {
                const would_be_bpdu = new BPDU(best.root_id, best.root_cost + port.path_cost, this.identifier, port.id);

                if (would_be_bpdu.lt(port.bpdu)) {
                    port.makeDesignated();
                } else {
                    port.makeBlocking();
                }
            }
        }
    }

    /**
     * Get the priority of the switch
     *
     * @returns Priority of the switch
     */
    getPriority() {
        return this.identifier.priority;
    }

    /**
     * Set the priority of the switch
     *
     * @param {number} priority New priority
     */
    setPriority(priority: number) {
        this.identifier.priority = priority;
        this.initialize();
    }

    onPacketReceived(iface: STPInterface, data: ArrayBuffer): void {
        const packet = Ethernet.ethernet(data);

        if (packet.dst === '01:81:c2:00:00:00' && packet instanceof Dot3) {
            if (packet.getNext() instanceof LLC) {
                const llc = packet.getNext() as LLC;
                if (llc.dsap === 0x42 && llc.ssap === 0x42 && llc.control === 3) {
                    if (llc.getNext() instanceof BPDUPacket) {
                        const bpdu_packet = llc.getNext() as BPDUPacket;
                        const bpdu = BPDU.fromPacket(bpdu_packet);
                        this.handleBPDU(bpdu, iface);
                    }
                }
            }
            return;
        }

        if (iface.state === PortState.Learning || iface.state === PortState.Forwarding) {
            this.mac_address_table[packet.src] = iface.getName();
        }

        if (iface.state === PortState.Forwarding) {
            if (packet.dst in this.mac_address_table) {
                if (this.getInterface(this.mac_address_table[packet.dst]).state === PortState.Forwarding) {
                    this.getInterface(this.mac_address_table[packet.dst]).send(data);
                }
            } else {
                this.getInterfaces()
                    .filter((intf) => intf !== iface)
                    .filter((intf) => intf.state === PortState.Forwarding)
                    .forEach((intf) => intf.send(data));
            }
        }
    }

    /**
     * Draw an STP interface
     *
     * @param {CanvasRenderingContext2D} ctx Canvas context used to draw
     * @param {STPInterface} intf Interface to draw
     * @param {number} devRadius Radius of the device to draw the interface on
     * @param {Vector2D} drawPos Draw position of the device
     * @param {Vector2D} direction Direction at which to put the interface
     * @param {string} color Color of the interface
     */
    private drawSTPInterface(
        ctx: CanvasRenderingContext2D,
        intf: Interface,
        devRadius: number,
        drawPos: Vector2D,
        direction: Vector2D
    ) {
        const intfPos = drawPos.add(direction.mul(devRadius + 5));

        switch ((intf as STPInterface).role) {
            case PortRole.Disabled:
                ctx.fillStyle = '#DD0000';
                break;
            case PortRole.Blocking:
                ctx.fillStyle = '#DDDD00';
                break;
            case PortRole.Root:
                ctx.fillStyle = '#0000DD';
                break;
            case PortRole.Designated:
                ctx.fillStyle = '#00DD00';
                break;
        }

        ctx.beginPath();
        ctx.arc(intfPos.x, intfPos.y, 5, 0.24 * Math.PI, 1.26 * Math.PI);
        ctx.fill();

        switch ((intf as STPInterface).state) {
            case PortState.Disabled:
                ctx.fillStyle = '#DD0000';
                break;
            case PortState.Blocking:
                ctx.fillStyle = '#DDDD00';
                break;
            case PortState.Listening:
                ctx.fillStyle = '#6666DD';
                break;
            case PortState.Learning:
                ctx.fillStyle = '#66DDDD';
                break;
            case PortState.Forwarding:
                ctx.fillStyle = '#00DD00';
                break;
        }

        ctx.beginPath();
        ctx.arc(intfPos.x, intfPos.y, 5, 1.25 * Math.PI, 0.25 * Math.PI);
        ctx.fill();
    }

    draw(ctx: CanvasRenderingContext2D, offset: Vector2D): void {
        this.drawSquareImage(ctx, this.getPosition().add(offset), STPSwitchImage, 12);
        const old = ctx.filter;
        ctx.filter = 'none';
        this.drawInterfaces(
            ctx,
            this.getPosition().add(offset),
            12,
            this.getInterfaces(),
            this.intfPositionSquare,
            this.drawSTPInterface.bind(this)
        );
        ctx.filter = old;
    }

    tick(): void {
        if (this.getBestBPDU().root_id.eq(this.identifier)) {
            if (this.time() > this.hello_timer_expiry) {
                this.broadcastConfig();
            }
        }

        for (const port of this.getInterfaces()) {
            port.doForward();

            if (this.time() > port.message_age_expiry) {
                port.bpdu = new BPDU(this.identifier, 0, this.identifier, port.id);
                port.makeDesignated();
                this.portAssignation();
            }
        }
    }

    reset(): void {
        this.initialize();
    }

    public getType(): string {
        return 'STP Switch';
    }

    public save(): SavedSTPSwitch {
        return {
            type: 'stp-switch',
            priority: this.getPriority(),
            name: this.getName(),
            interfaces: this.getInterfaces().map((intf) => intf.save()),
            x: this.getPosition().x,
            y: this.getPosition().y,
        };
    }

    /**
     * Load a STP switch from an object
     *
     * @param {Network} net Network to load into
     * @param {SavedSwitch} data Data to load from
     */
    public static load(net: Network, data: SavedSTPSwitch) {
        const host = new STPSwitch(net, data.name);
        host.removeAllInterfaces();
        host.setPosition(new Vector2D(data.x, data.y));
        host.identifier.priority = data.priority;
        data.interfaces.forEach((intf) => {
            host.addInterface(intf.name, intf.mac, intf.disabled, intf.cost);
        });
    }
}
