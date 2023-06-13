
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
    }
}
