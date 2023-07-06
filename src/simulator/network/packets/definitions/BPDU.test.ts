import { describe, expect, it } from 'vitest';
import { AnalysisTree, AnalyzedPacket } from '../Packet';
import { BPDU } from './BPDU';
import { Dot3 } from './Dot3';
import { Ethernet } from './Ethernet';
import { LLC } from './LLC';

describe('BPDU', () => {
    /**
     * Test the parse method
     */
    it('parse', () => {
        const data = new Uint8Array([
            1, 129, 194, 0, 0, 0, 0, 10, 0, 0, 0, 1, 0, 38, 66, 66, 3, 0, 0, 0, 0, 0, 128, 0, 0, 10, 0, 0, 0, 1, 0, 0,
            0, 0, 128, 0, 0, 10, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 55, 191, 165, 60,
        ]);

        const packet = Ethernet.ethernet(data.buffer);
        expect(packet).toBeInstanceOf(Dot3);

        expect(packet.src).toEqual('00:0a:00:00:00:01');
        expect(packet.dst).toEqual('01:81:c2:00:00:00');

        expect(packet.getNext()).toBeInstanceOf(LLC);
        const llc = packet.getNext() as LLC;
        expect(llc.dsap).toEqual(0x42);
        expect(llc.ssap).toEqual(0x42);
        expect(llc.control).toEqual(3);

        expect(llc.getNext()).toBeInstanceOf(BPDU);
        const bpdu = llc.getNext() as BPDU;

        expect(bpdu.root_priority).toEqual(0x8000);
        expect(bpdu.root_mac).toEqual('00:0a:00:00:00:01');
        expect(bpdu.root_cost).toEqual(0);
        expect(bpdu.bridge_priority).toEqual(0x8000);
        expect(bpdu.bridge_mac).toEqual('00:0a:00:00:00:01');
        expect(bpdu.bridge_port).toEqual(0x0001);
    });

    /**
     * Test the raw method
     */
    it('raw', () => {
        const packet = new Dot3({
            src: '00:0a:00:00:00:01',
            dst: '01:81:c2:00:00:00',
        });

        packet
            .setNext(
                new LLC({
                    dsap: 0x42,
                    ssap: 0x42,
                    control: 3,
                })
            )
            .setNext(
                new BPDU({
                    protocol_identifier: 0,
                    protocol_version: 0,
                    bpdu_type: 0,
                    bpdu_flags: 0,
                    root_priority: 0x8000,
                    root_mac: '00:0a:00:00:00:01',
                    root_cost: 0,
                    bridge_priority: 0x8000,
                    bridge_mac: '00:0a:00:00:00:01',
                    bridge_port: 0x0001,
                    message_age: 0,
                    max_age: 0,
                    forward_delay: 0,
                    hello_time: 0,
                })
            );

        const data = new Uint8Array([
            1, 129, 194, 0, 0, 0, 0, 10, 0, 0, 0, 1, 0, 38, 66, 66, 3, 0, 0, 0, 0, 0, 128, 0, 0, 10, 0, 0, 0, 1, 0, 0,
            0, 0, 128, 0, 0, 10, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 55, 191, 165, 60,
        ]);

        expect(new Uint8Array(packet.raw())).toEqual(data);
    });

    /**
     * Test the dissector method
     */
    it('dissector', () => {
        const data = new Uint8Array([
            1, 129, 194, 0, 0, 0, 0, 10, 0, 0, 0, 1, 0, 38, 66, 66, 3, 0, 0, 0, 0, 0, 128, 0, 0, 10, 0, 0, 0, 1, 0, 0,
            0, 0, 128, 0, 0, 10, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 55, 191, 165, 60,
        ]);

        const packet = Ethernet.ethernet(data.buffer);

        const out = new AnalyzedPacket(data.buffer, 0, 0, 'dev0', 'eth0', 'outgoing');
        packet.dissect(out);

        expect(out.source).toEqual('00:0a:00:00:00:01');
        expect(out.destination).toEqual('01:81:c2:00:00:00');
        expect(out.protocol).toEqual('STP');

        expect(out.tree.items.length).toEqual(3);
        expect(out.tree.start).toEqual(0);
        expect(out.tree.length).toEqual(64);

        expect((out.tree.items[2] as AnalysisTree).items.length).toEqual(12);
        expect((out.tree.items[2] as AnalysisTree).start).toEqual(17);
        expect((out.tree.items[2] as AnalysisTree).length).toEqual(35);
    });
});
