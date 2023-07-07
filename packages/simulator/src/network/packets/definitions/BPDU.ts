import { Field } from '../Field';
import { ByteField } from '../fields/ByteField';
import { ConditionalField } from '../fields/ConditionalField';
import { IntField } from '../fields/IntField';
import { MacField } from '../fields/MacField';
import { ShortField } from '../fields/ShortField';
import { XByteField } from '../fields/XByteField';
import { XShortField } from '../fields/XShortField';
import { Layer } from '../Layer';
import { Dissector, Packet, PostDissector } from '../Packet';
import { LLC } from './LLC';

/**
 * Fields used in a BPDU packet
 */
export interface BPDUFields {
    /**
     * Identifier of the protocol
     */
    protocol_identifier: number;

    /**
     * Version of the protocol
     */
    protocol_version: number;

    /**
     * Type of BPDU. 0x00 for config BPDU, 0X80 for Topology Change Notification
     */
    bpdu_type: number;

    /**
     * Flags of the BPDU
     */
    bpdu_flags?: number;

    /**
     * Priority of the root bridge
     */
    root_priority?: number;

    /**
     * MAC address of the root bridge
     */
    root_mac?: string;

    /**
     * Cost to the root
     */
    root_cost?: number;

    /**
     * Priority of the bridge
     */
    bridge_priority?: number;

    /**
     * MAC address of the bridge
     */
    bridge_mac?: string;

    /**
     * Port id
     */
    bridge_port?: number;

    /**
     * Age of the BPDU
     */
    message_age?: number;

    /**
     * Maximum Age
     */
    max_age?: number;

    /**
     * Hello Time
     */
    hello_time?: number;

    /**
     * Forward Delay
     */
    forward_delay?: number;
}

/**
 * Bridge Protocol Data Unit Packet
 */
export class BPDU extends Packet<BPDUFields> {
    static proto = 'STP';

    static fields: Field[] = [
        new XShortField('protocol_identifier'),
        new ByteField('protocol_version'),
        new XByteField('bpdu_type'),
        new ConditionalField(new XByteField('bpdu_flags'), (p: BPDU) => p.bpdu_type === 0),
        new ConditionalField(new ShortField('root_priority'), (p: BPDU) => p.bpdu_type === 0),
        new ConditionalField(new MacField('root_mac'), (p: BPDU) => p.bpdu_type === 0),
        new ConditionalField(new IntField('root_cost'), (p: BPDU) => p.bpdu_type === 0),
        new ConditionalField(new ShortField('bridge_priority'), (p: BPDU) => p.bpdu_type === 0),
        new ConditionalField(new MacField('bridge_mac'), (p: BPDU) => p.bpdu_type === 0),
        new ConditionalField(new ShortField('bridge_port'), (p: BPDU) => p.bpdu_type === 0),
        new ConditionalField(new ShortField('message_age'), (p: BPDU) => p.bpdu_type === 0),
        new ConditionalField(new ShortField('max_age'), (p: BPDU) => p.bpdu_type === 0),
        new ConditionalField(new ShortField('hello_time'), (p: BPDU) => p.bpdu_type === 0),
        new ConditionalField(new ShortField('forward_delay'), (p: BPDU) => p.bpdu_type === 0),
    ];

    static post_fields: Field[] = [];

    static dissector: Dissector<BPDUFields> = (packet, analyzed) => {
        analyzed.protocol = 'STP';

        if (packet.bpdu_type === 0) {
            analyzed.info =
                'Config BPDU: ' +
                packet.root_priority +
                '.' +
                packet.root_mac +
                '-' +
                packet.root_cost +
                ' ' +
                packet.bridge_priority +
                '.' +
                packet.bridge_mac +
                '-' +
                packet.bridge_port;
        } else {
            analyzed.info = 'TCN BPDU';
        }

        const sub = analyzed.tree.addSubTree('Spanning Tree Protocol', 0, packet.bpdu_type === 0x80 ? 4 : 35);

        sub?.addItem('Protocol Identifier: ' + packet.protocol_identifier, 0, 2);
        sub?.addItem('Protocol Version: ' + packet.protocol_version, 2, 1);
        sub?.addItem('BPDU Type: ' + packet.bpdu_type, 3, 1);

        if (packet.bpdu_type === 0) {
            sub?.addItem('BPDU Flags: ' + packet.bpdu_flags, 4, 1);

            const root_id = sub?.addSubTree('Root Identifier: ' + packet.root_priority + '.' + packet.root_mac, 5, 8);
            root_id?.addItem('Priority: ' + packet.root_priority, 0, 2);
            root_id?.addItem('Address: ' + packet.root_mac, 2, 6);
            sub?.addItem('Root cost: ' + packet.root_cost, 13, 4);
            const bridge_id = sub?.addSubTree(
                'Bridge Identifier: ' + packet.bridge_priority + '.' + packet.bridge_mac,
                17,
                8
            );
            bridge_id?.addItem('Priority: ' + packet.bridge_priority, 0, 2);
            bridge_id?.addItem('Address: ' + packet.bridge_mac, 2, 6);
            sub?.addItem('Port: ' + packet.bridge_port, 25, 2);

            sub?.addItem('Message Age: ' + packet.message_age / 256, 27, 2);
            sub?.addItem('Max Age: ' + packet.max_age / 256, 29, 2);
            sub?.addItem('Hello Time: ' + packet.hello_time / 256, 31, 2);
            sub?.addItem('Forward Delay: ' + packet.forward_delay / 256, 33, 2);
        }

        return sub;
    };

    static post_dissector: PostDissector<BPDUFields> = () => {
        //
    };
}

Layer.bind(LLC, BPDU, (p: LLC) => p.dsap === 0x42 && p.ssap === 0x42 && p.control === 3);
