import { describe, expect, it } from 'vitest';
import { IPv4 } from './IPv4';

describe('ipv4', () => {
    it('ipv4 to int', () => {
        expect(IPv4.toInt('0.0.0.0')).toBe(0x00000000n);
        expect(IPv4.toInt('255.255.255.255')).toBe(0xffffffffn);
        expect(IPv4.toInt('192.168.1.24')).toBe(0xc0a80118n);
    });

    it('int to ipv4', () => {
        expect(IPv4.fromInt(0x00000000n)).toBe('0.0.0.0');
        expect(IPv4.fromInt(0xffffffffn)).toBe('255.255.255.255');
        expect(IPv4.fromInt(0xc0a80118n)).toBe('192.168.1.24');
    });

    it('ipv4 to buffer', () => {
        expect(new Uint8Array(IPv4.toBuffer('0.0.0.0'))).toStrictEqual(new Uint8Array([0, 0, 0, 0]));
        expect(new Uint8Array(IPv4.toBuffer('255.255.255.255'))).toStrictEqual(new Uint8Array([255, 255, 255, 255]));
        expect(new Uint8Array(IPv4.toBuffer('192.168.1.24'))).toStrictEqual(new Uint8Array([192, 168, 1, 24]));
    });

    it('buffer to mac', () => {
        expect(IPv4.fromBuffer(new Uint8Array([0, 0, 0, 0]).buffer)).toBe('0.0.0.0');
        expect(IPv4.fromBuffer(new Uint8Array([255, 255, 255, 255]).buffer)).toBe('255.255.255.255');
        expect(IPv4.fromBuffer(new Uint8Array([192, 168, 1, 24]).buffer)).toBe('192.168.1.24');
    });
});
