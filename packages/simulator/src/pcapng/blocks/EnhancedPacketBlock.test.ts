import { describe, expect, it } from 'vitest';
import { EnhancedPacketBlock } from './EnhancedPacketBlock';

describe('enhanced packet block', () => {
    it('raw', () => {
        const block = new EnhancedPacketBlock(new Uint8Array([0xff, 0x00]), 1688023559000000n, 0, 2);

        expect(new Uint8Array(block.raw())).toStrictEqual(
            new Uint8Array([
                0, 0, 0, 6, 0, 0, 0, 36, 0, 0, 0, 0, 0x00, 0x05, 0xff, 0x3f, 0x9c, 0x9b, 0x4f, 0xc0, 0, 0, 0, 2, 0, 0,
                0, 2, 255, 0, 0, 0, 0, 0, 0, 36,
            ])
        );
    });
});
