import { Vector2D } from "../../drawing/Vector2D";
import { Network } from "../Network";
import { Ethernet } from "../packets/definitions/Ethernet";
import { Hub } from "./Hub";
import { Interface } from "./Interface";
import STPSwitchImg from '../../../assets/stp-switch.png';
import { MedicalInformationSharp, ThirteenMp, ThirtyFpsSelectRounded } from "@mui/icons-material";
import { BPDU as BPDUPacket } from '../packets/definitions/BPDU';

const STPSwitchImage = new Image()
STPSwitchImage.src = STPSwitchImg

enum PortState {
    Blocking = 0,
    Listening = 1,
    Learning = 2,
    Forwarding = 3,
    Disabled = 4
}

enum PortRole {
    Root = 0,
    Designated = 1,
    Blocking = 2,
    Disabled = 3
}

class Identifier {
    priority: number;
    mac: string;

    constructor(priority: number, mac: string) {
        this.priority = priority;
        this.mac = mac;
    }

    toNumber() {
        let mac = 0;
        this.mac.split(":").forEach((v: string, k: number) => {
            mac <<= 8
            mac |= parseInt(v, 16) & 0xFF
        });
        return this.priority << 48 | mac;
    }

    eq(other: Identifier) {
        return this.toNumber() === other.toNumber();
    }
}

class BPDU {
    root_id: Identifier;
    root_cost: number;
    bridge_id: Identifier;
    port_id: number;

    constructor(root_id: Identifier, root_cost: number, bridge_id: Identifier, port_id: number) {
        this.root_id = root_id;
        this.root_cost = root_cost;
        this.bridge_id = bridge_id;
        this.port_id = port_id;
    }

    static fromPacket(packet: BPDUPacket) {
        return new BPDU(
            new Identifier(packet.root_priority, packet.root_mac),
            packet.root_cost,
            new Identifier(packet.bridge_priority, packet.bridge_mac),
            packet.bridge_port
        )
    }

    toPacket(mac: string): Ethernet {
        const ether = new Ethernet({
            dst: '01:81:c2:00:00:00',
            src: mac,
            type: 0x8042
        })
        ether.setNext(new BPDUPacket({
            root_priority: this.root_id.priority,
            root_mac: this.root_id.mac,
            root_cost: this.root_cost,
            bridge_priority: this.bridge_id.priority,
            bridge_mac: this.bridge_id.mac,
            bridge_port: this.port_id
        }));
        return ether;
    }

    lt(other: BPDU): boolean {
        if (this.root_id.toNumber() !== other.root_id.toNumber())
            return this.root_id.toNumber() < other.root_id.toNumber();
        if (this.root_cost !== other.root_cost)
            return this.root_cost < other.root_cost;
        if (this.bridge_id.toNumber() !== other.bridge_id.toNumber())
            return this.bridge_id.toNumber() < other.bridge_id.toNumber();
        if (this.port_id !== other.port_id)
            return this.port_id < other.port_id;
        return false;
    }

    eq(other: BPDU): boolean {
        return (this.root_id.toNumber() === other.root_id.toNumber())
            && (this.root_cost === other.root_cost)
            && (this.bridge_id.toNumber() === other.bridge_id.toNumber())
            && (this.port_id === other.port_id);
    }

    winner(other: BPDU) {
        return this.lt(other) ? this : other;
    }
}

class PortData {
    controller: STPSwitch;
    id: number;
    path_cost: number;
    state: PortState = PortState.Blocking;
    role: PortRole = PortRole.Designated;
    bpdu: BPDU = new BPDU(new Identifier(0, '00:00:00:00:00:00'), 0, new Identifier(0, '00:00:00:00:00:00'), 0);

    hold_timer_expiry: number = 0;
    message_age_expiry: number = 0;
    forward_delay_expiry: number = 0;

    constructor(controller: STPSwitch, id: number, path_cost: number) {
        this.controller = controller;
        this.id = id;
        this.path_cost = path_cost;
        this.initialize();
    }

    initialize() {
        this.state = PortState.Blocking;
        this.role = PortRole.Designated;
        this.bpdu = new BPDU(this.controller.identifier, 0, this.controller.identifier, this.id);

        this.hold_timer_expiry = this.controller.network.time() + this.controller.hold_time;
        this.message_age_expiry = this.controller.network.time() + this.controller.message_age;
        this.forward_delay_expiry = this.controller.network.time() + this.controller.forward_delay;
    }

    canSend(): boolean {
        if (this.disabled() || this.blocking())
            return false;

        if (this.controller.network.time() < this.hold_timer_expiry)
            return false;

        return true;
    }

    enable() {
        this.initialize()
    }

    disable() {
        this.makeDesignated();
        this.updateState(PortState.Disabled, PortRole.Disabled);
    }

    disabled(): boolean {
        return this.role === PortRole.Disabled;
    }

    blocking(): boolean {
        return this.role === PortRole.Blocking;
    }

    updateConfig(config: BPDU) {
        this.bpdu = this.bpdu.winner(config);

        this.message_age_expiry = this.controller.network.time() + this.controller.message_age;
        this.controller.portAssignation();
    }

    doForward() {
        if (this.controller.network.time() > this.forward_delay_expiry) {
            switch (this.state) {
                case PortState.Listening:
                    this.updateState(PortState.Learning, this.role);
                    break;
                case PortState.Learning:
                    this.updateState(PortState.Forwarding, this.role);
                    break;
            }

            this.forward_delay_expiry = this.controller.network.time() + this.controller.forward_delay;
        }
    }

    updateState(state: PortState, role: PortRole) {
        this.state = state;
        this.role = role;

        this.message_age_expiry = this.controller.network.time() + this.controller.message_age;
    }

    makeBlocking() {
        if (this.disabled())
            return;

        if (this.state == PortState.Blocking && this.role == PortRole.Blocking)
            return;

        this.updateState(PortState.Blocking, PortRole.Blocking);
    }

    makeRoot() {
        if (this.disabled())
            return;

        if (this.state != PortState.Blocking && this.role == PortRole.Root)
            return;

        this.updateState(PortState.Listening, PortRole.Root);
    }

    makeDesignated() {
        if (this.disabled())
            return;

        if (this.state != PortState.Blocking && this.role == PortRole.Designated)
            return;

        this.updateState(PortState.Listening, PortRole.Designated);
    }
}

export class STPSwitch extends Hub {
    mac_address_table: { [mac: string]: string };
    identifier: Identifier;
    hello_timer_expiry: number = 0;
    port_infos: { [intf: string]: PortData }

    hold_time: number;
    message_age: number;
    forward_delay: number;
    hello_time: number;

    constructor(network: Network, name: string, mac: string, ports: number) {
        super(network, name, mac, ports);
        this.mac_address_table = {};
        this.identifier = new Identifier(32768, mac);
        this.port_infos = {};

        this.message_age = 20;
        this.forward_delay = 15;
        this.hold_time = 1;
        this.hello_time = 2;
        this.initialize();
    }

    initialize() {
        let i = 0;
        Object.values(this.interfaces).forEach(intf => {
            this.port_infos[intf.name] = new PortData(this, i, 1);
            this.port_infos[intf.name].initialize();
            i++;
        });

        this.hello_timer_expiry = this.network.time() + this.hello_time;
    }

    getBestBPDU(): BPDU {
        let best = this.port_infos[Object.values(this.interfaces)[0].name].bpdu
        Object.values(this.interfaces).forEach(intf => {
            best = best.winner(this.port_infos[intf.name].bpdu);
        });
        return best;
    }

    getRootPort(): PortData | null {
        if (this.getBestBPDU().root_id.eq(this.identifier))
            return null;

        let best = this.port_infos[Object.values(this.interfaces)[0].name]
        Object.values(this.interfaces).forEach(intf => {
            const tmp = best.bpdu.winner(this.port_infos[intf.name].bpdu);
            best = tmp === best.bpdu ? best : this.port_infos[intf.name];
        });
        return best;
    }

    transmitConfig(intf: Interface) {
        const port = this.port_infos[intf.name];
        if (!port.canSend())
            return;

        const best = this.getBestBPDU();
        const bpdu = new BPDU(best.root_id, best.root_cost + port.path_cost, this.identifier, port.id);

        intf.send(bpdu.toPacket(this.mac).raw());
    }

    broadcastConfig() {
        for (const intf of Object.values(this.interfaces)) {
            this.transmitConfig(intf);
        }

        if (this.network.time() > this.hello_timer_expiry) {
            this.hello_timer_expiry = this.network.time() + this.hello_time;
        }
    }

    handleBPDU(bpdu: BPDU, intf: Interface) {
        const port = this.port_infos[intf.name];
        port.updateConfig(bpdu);
        this.portAssignation();

        const root_port = this.getRootPort();
        if (root_port !== null) {
            if (port.id === root_port.id) {
                this.broadcastConfig();
            }
        }
    }

    portAssignation() {
        const best = this.getBestBPDU();

        for (const intf of Object.values(this.interfaces)) {
            const port = this.port_infos[intf.name];

            if (best.root_id.eq(this.identifier)) {
                port.makeDesignated();
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

        this.mac_address_table[packet.src] = iface.name;
        if (packet.dst === '01:81:c2:00:00:00') {
            if (packet.next instanceof BPDUPacket) {
                const bpdu_packet = packet.next as BPDUPacket;
                const bpdu = BPDU.fromPacket(bpdu_packet);
                this.handleBPDU(bpdu, iface);
            }
        } else if (packet.dst in this.mac_address_table) {
            this.getInterface(this.mac_address_table[packet.dst]).send(data);
        } else {
            for (const intf of Object.values(this.interfaces)) {
                if (intf !== iface)
                    intf.send(data);
            }
        }
    }

    drawSTPInterface(ctx: CanvasRenderingContext2D, intf: Interface, devRadius: number, drawPos: Vector2D, direction: Vector2D) {
        const intfPos = drawPos.add(direction.mul(devRadius + 5))

        switch (this.port_infos[intf.name].role) {
            case PortRole.Disabled:
                ctx.fillStyle = "#DD0000";
                break;
            case PortRole.Blocking:
                ctx.fillStyle = "#DDDD00";
                break;
            case PortRole.Root:
                ctx.fillStyle = "#0000DD";
                break;
            case PortRole.Designated:
                ctx.fillStyle = "#00DD00";
                break;
        }

        ctx.beginPath();
        ctx.arc(intfPos.x, intfPos.y, 5, 0.25 * Math.PI, 1.25 * Math.PI);
        ctx.fill();

        switch (this.port_infos[intf.name].state) {
            case PortState.Disabled:
                ctx.fillStyle = "#DD0000";
                break;
            case PortState.Blocking:
                ctx.fillStyle = "#DDDD00";
                break;
            case PortState.Listening:
                ctx.fillStyle = "#6666DD";
                break;
            case PortState.Learning:
                ctx.fillStyle = "#66DDDD";
                break;
            case PortState.Forwarding:
                ctx.fillStyle = "#00DD00";
                break;
        }

        ctx.beginPath();
        ctx.arc(intfPos.x, intfPos.y, 5, 1.25 * Math.PI, 0.25 * Math.PI);
        ctx.fill();
    }

    draw(ctx: CanvasRenderingContext2D, offset: Vector2D): void {
        this.drawSquareImage(ctx, this.position.add(offset), STPSwitchImage, 12);
        this.drawInterfaces(ctx, this.position.add(offset), 12, Object.values(this.interfaces), this.intfPositionSquare, this.drawSTPInterface.bind(this));
    }

    tick(): void {
        if (this.getBestBPDU().root_id.eq(this.identifier)) {
            if (this.network.time() > this.hello_timer_expiry) {
                this.broadcastConfig();
            }
        }

        for (const port of Object.values(this.port_infos)) {
            port.doForward();

            if (this.network.time() > port.message_age_expiry) {
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
