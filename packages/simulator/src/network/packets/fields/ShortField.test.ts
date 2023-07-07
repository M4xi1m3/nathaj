import { describe, expect, it } from 'vitest';
import { _Packet } from '../Packet';
import { ShortField } from './ShortField';

describe('Unsigned short field', () => {
    it('parse', () => {
        const p: any = {};
        const d = new Uint8Array([0, 5]).buffer;
        const f = new ShortField('data');
        f.parse(d, 0, p as _Packet<{ data: number }>);

        expect(p['data']).toEqual(5);
    });

    it('raw', () => {
        const p: any = { data: 10 };
        let d = new ArrayBuffer(0);
        const f = new ShortField('data');
        d = f.raw(d, p as _Packet<{ data: number }>);

        expect(new Uint8Array(d)).toEqual(new Uint8Array([0, 10]));
    });

    it('repr', () => {
        const f = new ShortField('data');
        expect(f.repr(15)).toEqual('15');
    });
});
