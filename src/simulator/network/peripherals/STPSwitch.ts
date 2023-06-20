import STPSwitchImg from '../../../assets/stp-switch.png';
import { Vector2D } from '../../drawing/Vector2D';
import { Network } from '../Network';
import { BPDU as BPDUPacket } from '../packets/definitions/BPDU';
import { Ethernet } from '../packets/definitions/Ethernet';
import { Interface } from './Interface';
import { Switch } from './Switch';

const STPSwitchImage = new Image();
STPSwitchImage.src = STPSwitchImg;

/**
 * State of the ports
 */
enum PortState {
    Blocking = 0,
    Listening = 1,
    Learning = 2,
    Forwarding = 3,
    Disabled = 4,
}

/**
 * Roles of the ports
 */
enum PortRole {
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
    toNumber() {
        let mac = 0;
        this.mac.split(':').forEach((v: string) => {
            mac <<= 8;
            mac |= parseInt(v, 16) & 0xff;
        });
        return (this.priority << 48) | mac;
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
     * @param {string} mac Ethernet packet's source address
     * @returns {Ethernet} Ethernet packet containing the BPDU
     */
    toPacket(mac: string): Ethernet {
        const ether = new Ethernet({
            dst: '01:81:c2:00:00:00',
            src: mac,
            type: 0x8042,
        });
        ether.setNext(
            new BPDUPacket({
                root_priority: this.root_id.priority,
                root_mac: this.root_id.mac,
                root_cost: this.root_cost,
                bridge_priority: this.bridge_id.priority,
                bridge_mac: this.bridge_id.mac,
                bridge_port: this.port_id,
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
 * Class storing the data of a port in an STP switch
 *
 * @internal
 */
class PortData {
    /**
     * Controller to which the port is attached
     */
    controller: STPSwitch;

    /**
     * ID of the port
     */
    id: number;

    /**
     * Cost of traveling trough the port
     */
    path_cost: number;

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

    constructor(controller: STPSwitch, id: number, path_cost: number) {
        this.controller = controller;
        this.id = id;
        this.path_cost = path_cost;
        this.initialize();
    }

    /**
     * Initialize the port's data
     */
    initialize() {
        this.state = PortState.Blocking;
        this.role = PortRole.Designated;
        this.bpdu = new BPDU(this.controller.identifier, this.path_cost, this.controller.identifier, this.id);

        this.hold_timer_expiry = this.controller.time() + this.controller.hold_time;
        this.message_age_expiry = this.controller.time() + this.controller.message_age;
        this.forward_delay_expiry = this.controller.time() + this.controller.forward_delay;
    }

    /**
     * Check if the port can send a BPDU
     *
     * @returns {boolean} True if the port can send BPDUs
     */
    canSend(): boolean {
        if (this.disabled() || this.blocking()) return false;

        if (this.controller.time() < this.hold_timer_expiry) return false;

        return true;
    }

    /**
     * Enable the port
     */
    enable() {
        this.initialize();
    }

    /**
     * Disable the port
     */
    disable() {
        this.makeDesignated();
        this.updateState(PortState.Disabled, PortRole.Disabled);
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

        this.message_age_expiry = this.controller.time() + this.controller.message_age;
        this.controller.portAssignation();
    }

    /**
     * Advance in the Listening -> Learning -> Forwarding state cycle
     */
    doForward() {
        if (this.controller.time() > this.forward_delay_expiry) {
            switch (this.state) {
                case PortState.Listening:
                    this.updateState(PortState.Learning, this.role);
                    break;
                case PortState.Learning:
                    this.updateState(PortState.Forwarding, this.role);
                    break;
            }

            this.forward_delay_expiry = this.controller.time() + this.controller.forward_delay;
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

        this.message_age_expiry = this.controller.time() + this.controller.message_age;
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
}

/**
 * Switch implementing the spanninf tree protocol
 *
 * See IEEE 802.1D (1998) section 8 and 9
 */
export class STPSwitch extends Switch {
    /**
     * Switch identifier
     * @internal
     */
    identifier: Identifier;

    private hello_timer_expiry = 0;

    /**
     * Ports informations
     * @internal
     */
    private port_infos: { [intf: string]: PortData };

    hold_time: number;
    message_age: number;
    forward_delay: number;
    hello_time: number;

    /**
     * Create a stp-capable switch
     *
     * @param {Network} network Network to put the switch in
     * @param {string} name Name of the switch
     * @param {string} mac MAC address of the switch
     * @param {number} ports Number of interfaces to create
     */
    constructor(network: Network, name: string, mac: string, ports: number) {
        super(network, name, mac, ports);
        this.identifier = new Identifier(32768, mac);
        this.port_infos = {};

        this.message_age = 20;
        this.forward_delay = 15;
        this.hold_time = 1;
        this.hello_time = 2;
        this.initialize();
    }

    /**
     * Initialize the states
     */
    private initialize() {
        let i = 0;
        this.getInterfaces().forEach((intf) => {
            this.port_infos[intf.getName()] = new PortData(this, i, 1);
            this.port_infos[intf.getName()].initialize();
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
        let best = this.port_infos[this.getInterfaces()[0].getName()].bpdu;
        this.getInterfaces().forEach((intf) => {
            best = best.winner(this.port_infos[intf.getName()].bpdu);
        });
        return best;
    }

    /**
     * Get the root port's data
     *
     * @returns {PortData | null} Root's port data, or null if the switch has no root port (ie. is a root switch)
     * @internal
     */
    private getRootPort(): PortData | null {
        if (this.getBestBPDU().root_id.eq(this.identifier)) return null;

        let best = this.port_infos[this.getInterfaces()[0].getName()];

        this.getInterfaces().forEach((intf) => {
            const tmp = best.bpdu.winner(this.port_infos[intf.getName()].bpdu);
            best = tmp === best.bpdu ? best : this.port_infos[intf.getName()];
        });
        return best;
    }

    /**
     * Transmit a BPDU to an interface
     *
     * @param {Interface} intf Interface to tramit a BPDU to
     */
    private transmitConfig(intf: Interface): void {
        const port = this.port_infos[intf.getName()];
        if (!port.canSend()) return;

        const best = this.getBestBPDU();
        const bpdu = new BPDU(
            best.root_id,
            best.bridge_id.eq(this.identifier) ? port.path_cost : best.root_cost + port.path_cost,
            this.identifier,
            port.id
        );

        intf.send(bpdu.toPacket(this.getMac()).raw());
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
     * @param {Interface} intf Interface on which the BPDU was received
     * @internal
     */
    private handleBPDU(bpdu: BPDU, intf: Interface) {
        const port = this.port_infos[intf.getName()];
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

        for (const intf of this.getInterfaces()) {
            const port = this.port_infos[intf.getName()];

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

    onPacketReceived(iface: Interface, data: ArrayBuffer): void {
        const packet = new Ethernet(data);

        this.mac_address_table[packet.src] = iface.getName();
        if (packet.dst === '01:81:c2:00:00:00') {
            if (packet.getNext() instanceof BPDUPacket) {
                const bpdu_packet = packet.getNext() as BPDUPacket;
                const bpdu = BPDU.fromPacket(bpdu_packet);
                this.handleBPDU(bpdu, iface);
            }
        } else if (packet.dst in this.mac_address_table) {
            this.getInterface(this.mac_address_table[packet.dst]).send(data);
        } else {
            this.getInterfaces()
                .filter((intf) => intf !== iface)
                .forEach((intf) => intf.send(data));
        }
    }

    /**
     * Draw an STP interface
     *
     * @param {CanvasRenderingContext2D} ctx Canvas context used to draw
     * @param {Interface} intf Interface to draw
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

        switch (this.port_infos[intf.getName()].role) {
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
        ctx.arc(intfPos.x, intfPos.y, 5, 0.25 * Math.PI, 1.25 * Math.PI);
        ctx.fill();

        switch (this.port_infos[intf.getName()].state) {
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
        this.drawInterfaces(
            ctx,
            this.getPosition().add(offset),
            12,
            this.getInterfaces(),
            this.intfPositionSquare,
            this.drawSTPInterface.bind(this)
        );
    }

    tick(): void {
        if (this.getBestBPDU().root_id.eq(this.identifier)) {
            if (this.time() > this.hello_timer_expiry) {
                this.broadcastConfig();
            }
        }

        for (const port of Object.values(this.port_infos)) {
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
}
