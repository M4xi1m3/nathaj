import { Field } from '../Field';
import { XByteField } from '../fields/XByteField';
import { Layer } from '../Layer';
import { Dissector, Packet, PostDissector } from '../Packet';
import { Dot3 } from './Dot3';

/**
 * Fields used in an LLC packet
 */
export interface LLCFields {
    /**
     * Destination Service Access Point
     */
    dsap: number;

    /**
     * Source Service Access Point
     */
    ssap: number;

    /**
     * Control information
     */
    control: number;
}

/**
 * LLC packet
 */
export class LLC extends Packet<LLCFields> {
    static proto = 'LLC';
    static fields: Field[] = [new XByteField('dsap'), new XByteField('ssap'), new XByteField('control')];
    static post_fields: Field[] = [];

    static dissector: Dissector<LLCFields> = (packet, analyzed) => {
        analyzed.protocol = 'LLC';
        analyzed.info =
            (packet.control === 0xe3 ? 'TEST Request ' : packet.control === 0xf3 ? 'TEST Reply ' : ' ') +
            '(DSAP: ' +
            LLC.fields[0].repr(packet.dsap) +
            ', SSAP: ' +
            LLC.fields[1].repr(packet.ssap) +
            ', Control: ' +
            LLC.fields[2].repr(packet.control) +
            ')';

        const sub = analyzed.tree.addSubTree('LLC', 0, 3);
        sub?.addItem('DSAP: ' + LLC.fields[0].repr(packet.dsap), 0, 1);
        sub?.addItem('SSAP: ' + LLC.fields[1].repr(packet.ssap), 1, 1);
        sub?.addItem('Control: ' + LLC.fields[2].repr(packet.control), 2, 1);

        return sub;
    };

    static post_dissector: PostDissector<LLCFields> = () => {
        //
    };
}

Layer.bind(Dot3, LLC, () => true);
