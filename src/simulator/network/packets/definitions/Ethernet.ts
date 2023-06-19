
import { Field, MacField, XShortField } from "../Field";
import { Dissector, Packet } from "../Packet";

interface EthernetFields {
    src: string;
    dst: string;
    type: number;
}

export class Ethernet extends Packet<EthernetFields> {
    static proto: string = "Ethernet";
    static fields: Field[] = [
        new MacField("src"),
        new MacField("dst"),
        new XShortField("type")
    ];

    static dissector: Dissector<EthernetFields> = (packet, analyzed) => {
        analyzed.source = packet.src;
        analyzed.destination = packet.dst;
        analyzed.protocol = this.fields[2].repr(packet.type);
        analyzed.info = "Ethernet";

        const sub = analyzed.tree.addSubTree("Ethernet", 0, 14);
        sub?.addItem("Source: " + packet.src, 0, 6);
        sub?.addItem("Destionation: " + packet.src, 6, 6);
        sub?.addItem("Type: " + packet.type, 12, 2);
    }
}
