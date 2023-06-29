import { describe, expect, it } from 'vitest';
import { AnalysisTree, AnalyzedPacket } from '../Packet';
import { BPDU } from './BPDU';
import { Ethernet } from './Ethernet';

describe('BPDU', () => {
    /**
     * Test the parse method
     */
    it('parse', () => {
        const data = new Uint8Array([
            0x01, 0x81, 0xc2, 0x00, 0x00, 0x00, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x01, 0x80, 0x42, 0x80, 0x00, 0x00, 0x0a,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01,
        ]);

        const packet = new Ethernet(data.buffer);

        expect(packet.src).toEqual('00:0a:00:00:00:01');
        expect(packet.dst).toEqual('01:81:c2:00:00:00');
        expect(packet.type).toEqual(0x8042);

        expect(packet.getNext()).toBeInstanceOf(BPDU);
        const bpdu = packet.getNext() as BPDU;

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
        const packet = new Ethernet({
            src: '00:0a:00:00:00:01',
            dst: '01:81:c2:00:00:00',
            type: 0x8042,
        });

        packet.setNext(
            new BPDU({
                root_priority: 0x8000,
                root_mac: '00:0a:00:00:00:01',
                root_cost: 0,
                bridge_priority: 0x8000,
                bridge_mac: '00:0a:00:00:00:01',
                bridge_port: 0x0001,
            })
        );

        const data = new Uint8Array([
            0x01, 0x81, 0xc2, 0x00, 0x00, 0x00, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x01, 0x80, 0x42, 0x80, 0x00, 0x00, 0x0a,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01,
        ]);

        expect(new Uint8Array(packet.raw())).toEqual(data);
    });

    /**
     * Test the dissector method
     */
    it('dissector', () => {
        const data = new Uint8Array([
            0x01, 0x81, 0xc2, 0x00, 0x00, 0x00, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x01, 0x80, 0x42, 0x80, 0x00, 0x00, 0x0a,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01,
        ]);

        const packet = new Ethernet(data.buffer);

        const out = new AnalyzedPacket(data, 0, 0, 'dev0', 'eth0', 'outgoing');
        packet.dissect(out);

        expect(out.source).toEqual('00:0a:00:00:00:01');
        expect(out.destination).toEqual('01:81:c2:00:00:00');
        expect(out.protocol).toEqual('STP');

        expect(out.tree.items.length).toEqual(2);
        expect(out.tree.start).toEqual(0);
        expect(out.tree.length).toEqual(14 + 22);

        expect((out.tree.items[1] as AnalysisTree).items.length).toEqual(4);
        expect((out.tree.items[1] as AnalysisTree).start).toEqual(14);
        expect((out.tree.items[1] as AnalysisTree).length).toEqual(22);
    });
});
