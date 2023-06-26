import { describe, expect, it } from 'vitest';
import { AnalysisTree, AnalyzedPacket } from '../Packet';
import { Ethernet } from './Ethernet';

describe('Ethernet', () => {
    /**
     * Test the parse method
     */
    it('parse', () => {
        const data = new Uint8Array([
            0x00, 0x0a, 0x00, 0x00, 0x00, 0x01, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00,
        ]);

        const packet = new Ethernet(data.buffer);

        expect(packet.src).toEqual('00:0a:00:00:00:01');
        expect(packet.dst).toEqual('00:0a:00:00:00:02');
        expect(packet.type).toEqual(0x0000);
    });

    /**
     * Test the raw method
     */
    it('raw', () => {
        const packet = new Ethernet({
            src: '00:0a:00:00:00:01',
            dst: '00:0a:00:00:00:02',
            type: 0x0000,
        });

        const data = new Uint8Array([
            0x00, 0x0a, 0x00, 0x00, 0x00, 0x01, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00,
        ]);

        expect(new Uint8Array(packet.raw())).toEqual(data);
    });

    /**
     * Test the dissector method
     */
    it('dissector', () => {
        const data = new Uint8Array([
            0x00, 0x0a, 0x00, 0x00, 0x00, 0x01, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00,
        ]);

        const packet = new Ethernet(data.buffer);

        const out = new AnalyzedPacket(data, 0, 0, 'dev0', 'eth0', 'outgoing');
        packet.dissect(out);

        expect(out.source).toEqual('00:0a:00:00:00:01');
        expect(out.destination).toEqual('00:0a:00:00:00:02');
        expect(out.protocol).toEqual('0x0000');
        expect(out.info).toEqual('Ethernet');

        expect(out.tree.items.length).toEqual(1);
        expect(out.tree.start).toEqual(0);
        expect(out.tree.length).toEqual(14);
        expect((out.tree.items[0] as AnalysisTree).items.length).toEqual(3);
        expect((out.tree.items[0] as AnalysisTree).start).toEqual(0);
        expect((out.tree.items[0] as AnalysisTree).length).toEqual(14);

        expect((out.tree.items[0] as AnalysisTree).items[0].start).toEqual(0);
        expect((out.tree.items[0] as AnalysisTree).items[0].length).toEqual(6);
        expect((out.tree.items[0] as AnalysisTree).items[1].start).toEqual(6);
        expect((out.tree.items[0] as AnalysisTree).items[1].length).toEqual(6);
        expect((out.tree.items[0] as AnalysisTree).items[2].start).toEqual(12);
        expect((out.tree.items[0] as AnalysisTree).items[2].length).toEqual(2);
    });
});
