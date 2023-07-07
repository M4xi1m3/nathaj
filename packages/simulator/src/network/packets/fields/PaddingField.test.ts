import { describe, expect, it } from 'vitest';
import { _Packet } from '../Packet';
import { ByteField } from './ByteField';
import { PaddingField } from './PaddingField';

describe('Padding field', () => {
    it('parse has padding', () => {
        const p: any = {};
        const d = new ArrayBuffer(4);
        const f = new PaddingField('data', 8);
        f.parse(d, 4, p as _Packet<{ data: number }>);

        expect(new Uint8Array(p['data'])).toEqual(new Uint8Array([0, 0, 0, 0]));
    });

    it('parse no padding', () => {
        const p: any = {};
        const d = new ArrayBuffer(12);
        const f = new PaddingField('data', 8);
        f.parse(d, 12, p as _Packet<{ data: number }>);

        expect(new Uint8Array(p['data'])).toEqual(new Uint8Array([]));
    });

    it('parse has padding mid packet', () => {
        const p: any = {};
        const d = new ArrayBuffer(12);
        const f = new PaddingField('data', 8);
        f.parse(d, 4, p as _Packet<{ data: number }>);

        expect(new Uint8Array(p['data'])).toEqual(new Uint8Array([0, 0, 0, 0]));
    });

    it('raw has padding', () => {
        const p: any = {};
        let d = new ArrayBuffer(4);
        const f = new PaddingField('data', 8);
        d = f.raw(d, p as _Packet<{ data: number }>);

        expect(new Uint8Array(d)).toEqual(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]));
    });

    it('raw no padding', () => {
        const p: any = {};
        let d = new ArrayBuffer(8);
        const f = new PaddingField('data', 8);
        d = f.raw(d, p as _Packet<{ data: number }>);

        expect(new Uint8Array(d)).toEqual(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]));
    });

    it('repr', () => {
        const f = new ByteField('data');
        expect(f.repr(15)).toEqual('15');
    });
});
