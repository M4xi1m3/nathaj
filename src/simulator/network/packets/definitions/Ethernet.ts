import { Field } from '../Field';
import { MacField } from '../fields/MacField';
import { XShortField } from '../fields/XShortField';
import { Dissector, Packet } from '../Packet';

/**
 * Fields used in an Ethernet packet
 */
export interface EthernetFields {
    /**
     * Source MAC address
     */
    src: string;

    /**
     * Destination MAC address
     */
    dst: string;

    /**
     * Protocol type
     */
    type: number;
}

/**
 * Ethernet packet
 */
export class Ethernet extends Packet<EthernetFields> {
    static proto = 'Ethernet';
    static fields: Field[] = [new MacField('dst'), new MacField('src'), new XShortField('type')];

    static dissector: Dissector<EthernetFields> = (packet, analyzed) => {
        analyzed.source = packet.src;
        analyzed.destination = packet.dst;
        analyzed.protocol = this.fields[2].repr(packet.type);
        analyzed.info = 'Ethernet';

        const sub = analyzed.tree.addSubTree('Ethernet', 0, 14);
        sub?.addItem('Destionation: ' + packet.dst, 0, 6);
        sub?.addItem('Source: ' + packet.src, 6, 6);
        sub?.addItem('Type: ' + packet.type, 12, 2);
    };
}
