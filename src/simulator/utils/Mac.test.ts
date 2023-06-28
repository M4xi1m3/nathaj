import { describe, expect, it } from 'vitest';
import { InvalidMACException, Mac } from './Mac';

describe('mac', () => {
    it('mac to int', () => {
        expect(Mac.toInt('00:00:00:00:00:00')).toBe(0x000000000000n);
        expect(Mac.toInt('ff:ff:ff:ff:ff:ff')).toBe(0xffffffffffffn);
        expect(Mac.toInt('00:0a:00:01:56:bd')).toBe(0x000a000156bdn);
    });

    it('int to mac', () => {
        expect(Mac.fromInt(0x000000000000n)).toBe('00:00:00:00:00:00');
        expect(Mac.fromInt(0xffffffffffffn)).toBe('ff:ff:ff:ff:ff:ff');
        expect(Mac.fromInt(0x000a000156bdn)).toBe('00:0a:00:01:56:bd');
    });

    it('mac to buffer', () => {
        expect(new Uint8Array(Mac.toBuffer('00:00:00:00:00:00'))).toStrictEqual(new Uint8Array([0, 0, 0, 0, 0, 0]));
        expect(new Uint8Array(Mac.toBuffer('ff:ff:ff:ff:ff:ff'))).toStrictEqual(
            new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff])
        );
        expect(new Uint8Array(Mac.toBuffer('00:0a:00:01:56:bd'))).toStrictEqual(
            new Uint8Array([0x00, 0x0a, 0x00, 0x01, 0x56, 0xbd])
        );
    });

    it('buffer to mac', () => {
        expect(Mac.fromBuffer(new Uint8Array([0, 0, 0, 0, 0, 0]).buffer)).toBe('00:00:00:00:00:00');
        expect(Mac.fromBuffer(new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff]).buffer)).toBe('ff:ff:ff:ff:ff:ff');
        expect(Mac.fromBuffer(new Uint8Array([0x00, 0x0a, 0x00, 0x01, 0x56, 0xbd]).buffer)).toBe('00:0a:00:01:56:bd');
    });

    it('increment mac', () => {
        expect(Mac.increment('12:34:56:78:90:00', 0x1ff)).toBe('12:34:56:78:91:ff');
        expect(Mac.increment('12:34:56:78:90:f9', -4)).toBe('12:34:56:78:90:f5');
        expect(() => Mac.increment('ff:ff:ff:ff:ff:00', 0x1ff)).toThrow(InvalidMACException);
        expect(() => Mac.increment('00:00:00:00:00:12', -0x1ff)).toThrow(InvalidMACException);
    });
});
