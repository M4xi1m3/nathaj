import { CRC32 } from '../../../utils/CRC32';
import { Field } from '../Field';
import { FCSField } from '../fields/FCSField';
import { LenField } from '../fields/LenField';
import { MacField } from '../fields/MacField';
import { PaddingField } from '../fields/PaddingField';
import { AnalysisItem, Dissector, Packet, PostDissector } from '../Packet';

/**
 * Fields used in an Dot3 packet
 */
export interface Dot3Fields {
    /**
     * Source MAC address
     */
    src: string;

    /**
     * Destination MAC address
     */
    dst: string;

    /**
     * Data length
     */
    length?: number;

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
 * Dot3 packet
 */
export class Dot3 extends Packet<Dot3Fields> {
    static proto = 'IEEE 802.3 Ethernet';
    static fields: Field[] = [new MacField('dst'), new MacField('src'), new LenField('length')];
    static post_fields: Field[] = [new PaddingField('padding', 60), new FCSField('fcs')];

    static dissector: Dissector<Dot3Fields> = (packet, analyzed) => {
        analyzed.source = packet.src;
        analyzed.destination = packet.dst;
        analyzed.protocol = 'IEEE 802.3';
        analyzed.info = 'IEEE 802.3 Ethernet';

        const sub = analyzed.tree.addSubTree('IEEE 802.3 Ethernet', 0, 14);
        sub?.addItem('Destionation: ' + packet.dst, 0, 6);
        sub?.addItem('Source: ' + packet.src, 6, 6);
        sub?.addItem('Length: ' + Dot3.fields[2].repr(packet.length), 12, 2);

        return sub;
    };

    static post_dissector: PostDissector<Dot3Fields> = (packet, analyzed, tree) => {
        const len = analyzed.data.byteLength;

        if (packet.padding.byteLength !== 0)
            tree.items.push(
                new AnalysisItem(
                    'Padding: ' + packet.padding.byteLength + ' bytes',
                    len - 4 - packet.padding.byteLength,
                    packet.padding.byteLength
                )
            );

        const data = CRC32.ethernet(analyzed.data.slice(0, len - 4));
        const dw = new DataView(data);
        const valid = dw.getUint32(0) === packet.fcs;

        tree.items.push(
            new AnalysisItem(
                'FCS: ' + Dot3.post_fields[1].repr(packet.fcs) + ' (' + (valid ? 'valid' : 'invalid') + ')',
                len - 4,
                4
            )
        );
    };
}
