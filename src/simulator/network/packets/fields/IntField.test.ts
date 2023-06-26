import { describe, expect, it } from 'vitest';
import { _Packet } from '../Packet';
import { IntField } from './IntField';

describe('Int field', () => {
    it('parse', () => {
        const p: any = {};
        const d = new Uint8Array([0, 0, 0, 5]).buffer;
        const f = new IntField('data');
        f.parse(d, p as _Packet<{ data: number }>);

        expect(p['data']).toEqual(5);
    });

    it('raw', () => {
        const p: any = { data: 10 };
        let d = new ArrayBuffer(0);
        const f = new IntField('data');
        d = f.raw(d, p as _Packet<{ data: number }>);

        expect(new Uint8Array(d)).toEqual(new Uint8Array([0, 0, 0, 10]));
    });

    it('repr', () => {
        const f = new IntField('data');
        expect(f.repr(15)).toEqual('15');
    });
});
