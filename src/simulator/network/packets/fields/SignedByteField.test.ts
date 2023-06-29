import { describe, expect, it } from 'vitest';
import { _Packet } from '../Packet';
import { SignedByteField } from './SignedByteField';

describe('Signed byte field', () => {
    it('parse', () => {
        const p: any = {};
        const d = new Uint8Array([0xff]).buffer;
        const f = new SignedByteField('data');
        f.parse(d, 0, p as _Packet<{ data: number }>);

        expect(p['data']).toEqual(-1);
    });

    it('raw', () => {
        const p: any = { data: -2 };
        let d = new ArrayBuffer(0);
        const f = new SignedByteField('data');
        d = f.raw(d, p as _Packet<{ data: number }>);

        expect(new Uint8Array(d)).toEqual(new Uint8Array([0xfe]));
    });

    it('repr', () => {
        const f = new SignedByteField('data');
        expect(f.repr(-1)).toEqual('-1');
    });
});
