import { describe, expect, it } from 'vitest';
import { PcapngBlock } from './PcapngBlock';

class DummyBlock extends PcapngBlock {
    get type(): number {
        return 42;
    }
    get body(): ArrayBuffer {
        return new Uint8Array([0xca, 0xfe]).buffer;
    }
}

describe('pcap block', () => {
    it('raw', () => {
        const block = new DummyBlock();

        expect(new Uint8Array(block.raw())).toStrictEqual(
            new Uint8Array([
                0,
                0,
                0,
                42, // Type
                0,
                0,
                0,
                16, // Length
                0xca,
                0xfe, // Body
                0,
                0, // Padding
                0,
                0,
                0,
                16, // Length
            ])
        );
    });
});
