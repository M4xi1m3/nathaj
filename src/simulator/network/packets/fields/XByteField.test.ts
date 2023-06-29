import { describe, expect, it } from 'vitest';
import { _Packet } from '../Packet';
import { XByteField } from './XByteField';

describe('Hex byte field', () => {
    it('parse', () => {
        const p: any = {};
        const d = new Uint8Array([5]).buffer;
        const f = new XByteField('data');
        f.parse(d, 0, p as _Packet<{ data: number }>);

        expect(p['data']).toEqual(5);
    });

    it('raw', () => {
        const p: any = { data: 10 };
        let d = new ArrayBuffer(0);
        const f = new XByteField('data');
        d = f.raw(d, p as _Packet<{ data: number }>);

        expect(new Uint8Array(d)).toEqual(new Uint8Array([10]));
    });

    it('repr', () => {
        const f = new XByteField('data');
        expect(f.repr(15)).toEqual('0x0f');
    });
});
