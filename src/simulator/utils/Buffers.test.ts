import { describe, expect, it } from 'vitest';
import { Buffers } from './Buffers';

describe('Buffers', () => {
    it('concatenate', () => {
        const a = new Uint8Array([0, 1]).buffer;
        const b = new Uint8Array([2, 3, 4]).buffer;

        const c = Buffers.concatenate(a, b);

        expect(new Uint8Array(c)).toEqual(new Uint8Array([0, 1, 2, 3, 4]));
    });

    it('hex', () => {
        const a = new Uint8Array([0xca, 0xfe, 0xba, 0xbe, 0x13, 0x12]).buffer;
        expect(Buffers.hex(a)).toBe('cafebabe1312');
    });
});
