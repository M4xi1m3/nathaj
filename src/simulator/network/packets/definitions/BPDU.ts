import { parseJsonConfigFileContent } from "typescript";
import { Field, IntField, MacField, ShortField, XShortField } from "../Field";
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
    }
}

Layer.bind(Ethernet, BPDU, (p: Ethernet) => p.type === 0x8042);
