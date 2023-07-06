import { describe, expect, it } from 'vitest';
import { _Packet } from '../Packet';
import { FloatField } from './FloatField';

describe('Float field', () => {
    it('parse', () => {
        const p: any = {};
        const d = new Uint8Array([63, 0, 0, 0]).buffer;
        const f = new FloatField('data');
        f.parse(d, 0, p as _Packet<{ data: number }>);

        expect(p['data']).toEqual(0.5);
    });

    it('raw', () => {
        const p: any = { data: 0.5 };
        let d = new ArrayBuffer(0);
        const f = new FloatField('data');
        d = f.raw(d, p as _Packet<{ data: number }>);

        expect(new Uint8Array(d)).toEqual(new Uint8Array([63, 0, 0, 0]));
    });

    it('repr', () => {
        const f = new FloatField('data');
        expect(f.repr(0.5)).toEqual('0.5');
    });
});
