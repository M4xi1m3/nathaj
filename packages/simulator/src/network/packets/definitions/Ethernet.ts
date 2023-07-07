import { CRC32 } from '../../../utils/CRC32';
import { Field } from '../Field';
import { FCSField } from '../fields/FCSField';
import { MacField } from '../fields/MacField';
import { PaddingField } from '../fields/PaddingField';
import { XShortField } from '../fields/XShortField';
import { AnalysisItem, Dissector, Packet, PostDissector } from '../Packet';
import { Dot3 } from './Dot3';

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
    static proto = 'Ethernet II';
    static fields: Field[] = [new MacField('dst'), new MacField('src'), new XShortField('type')];
    static post_fields: Field[] = [new PaddingField('padding', 60), new FCSField('fcs')];

    static dissector: Dissector<EthernetFields> = (packet, analyzed) => {
        analyzed.source = packet.src;
        analyzed.destination = packet.dst;
        analyzed.protocol = Ethernet.fields[2].repr(packet.type);
        analyzed.info = 'Ethernet II';

        const sub = analyzed.tree.addSubTree('Ethernet II', 0, 14);
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

        const data = CRC32.ethernet(analyzed.data.slice(0, len - 4));
        const dw = new DataView(data);
        const valid = dw.getUint32(0) === packet.fcs;

        tree.items.push(
            new AnalysisItem(
                'FCS: ' + Ethernet.post_fields[1].repr(packet.fcs) + ' (' + (valid ? 'valid' : 'invalid') + ')',
                len - 4,
                4
            )
        );
    };

    /**
     * Parse a frame that is either Ethernet IEEE 802.3 or Ethernet II
     * @param data
     * @returns
     */
    public static ethernet(data: ArrayBuffer): Ethernet | Dot3 {
        const dw = new DataView(data);
        const length = dw.getUint16(12);
        if (length < 1500) {
            return new Dot3(data);
        } else {
            return new Ethernet(data);
        }
    }
}
