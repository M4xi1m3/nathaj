import { Field, IntField, MacField, ShortField } from "../Field";
import { Layer } from "../Layer";
import { Dissector, Packet } from "../Packet";
import { Ethernet } from "./Ethernet";

interface BPDUFields {
    root_priority: number;
    root_mac: string;
    root_cost: number;
    bridge_priority: number;
    bridge_mac: string;
    bridge_port: number;
}

export class BPDU extends Packet<BPDUFields> {
    static proto: string = "STP";
    static fields: Field[] = [
        new ShortField("root_priority"),
        new MacField("root_mac"),
        new IntField("root_cost"),
        new ShortField("bridge_priority"),
        new MacField("bridge_mac"),
        new ShortField("bridge_port"),
    ];

    static dissector: Dissector<BPDUFields> = (packet, analyzed) => {
        analyzed.protocol = "STP";
        analyzed.info = packet.root_priority + "." + packet.root_mac + "-" + packet.root_cost + " " + packet.bridge_priority + "." + packet.bridge_mac + "-" + packet.bridge_port;

        const sub = analyzed.tree.addSubTree("Spanning Tree Protocol", 0, 22);
        const root_id = sub?.addSubTree("Root Identifier: " +  packet.root_priority + "." + packet.root_mac, 0, 8);
        root_id?.addItem("Priority: " + packet.root_priority, 0, 2);
        root_id?.addItem("Address: " + packet.root_mac, 2, 6);
        sub?.addItem("Root cost: " + packet.root_cost, 8, 4);
        const bridge_id = sub?.addSubTree("Bridge Identifier: " +  packet.bridge_priority + "." + packet.bridge_mac, 12, 8);
        bridge_id?.addItem("Priority: " + packet.bridge_priority, 0, 2);
        bridge_id?.addItem("Address: " + packet.bridge_mac, 2, 6);
        sub?.addItem("Port: " + packet.bridge_port, 20, 2);
    }
}

Layer.bind(Ethernet, BPDU, (p: Ethernet) => p.type === 0x8042);
