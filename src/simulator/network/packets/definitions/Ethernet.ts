import { Field } from '../Field';
import { FCSField } from '../fields/FCSField';
import { MacField } from '../fields/MacField';
import { PaddingField } from '../fields/PaddingField';
import { XShortField } from '../fields/XShortField';
import { AnalysisItem, Dissector, Packet, PostDissector } from '../Packet';

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

    /**
     * Padding
     */
    padding?: ArrayBuffer;

    /**
     * Valud of the fcs
     */
    fcs?: number;
}

/**
 * Ethernet packet
 */
export class Ethernet extends Packet<EthernetFields> {
    static proto = 'Ethernet';
    static fields: Field[] = [new MacField('dst'), new MacField('src'), new XShortField('type')];
    static post_fields: Field[] = [new PaddingField('padding', 60), new FCSField('fcs')];

    static dissector: Dissector<EthernetFields> = (packet, analyzed) => {
        analyzed.source = packet.src;
        analyzed.destination = packet.dst;
        analyzed.protocol = Ethernet.fields[2].repr(packet.type);
        analyzed.info = 'Ethernet';

        const sub = analyzed.tree.addSubTree('Ethernet', 0, 14);
        sub?.addItem('Destionation: ' + packet.dst, 0, 6);
        sub?.addItem('Source: ' + packet.src, 6, 6);
        sub?.addItem('Type: ' + Ethernet.fields[2].repr(packet.type), 12, 2);

        return sub;
    };

    static post_dissector: PostDissector<EthernetFields> = (packet, analyzed, tree) => {
        const len = analyzed.data.byteLength;

        if (packet.padding.byteLength !== 0)
            tree.items.push(
                new AnalysisItem(
                    'Padding: ' + packet.padding.byteLength + ' bytes',
                    len - 4 - packet.padding.byteLength,
                    packet.padding.byteLength
                )
            );

        tree.items.push(new AnalysisItem('FCS: ' + Ethernet.post_fields[1].repr(packet.fcs), len - 4, 4));
    };
}
