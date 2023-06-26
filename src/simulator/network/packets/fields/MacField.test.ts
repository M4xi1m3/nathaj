import { describe, expect, it } from 'vitest';
import { _Packet } from '../Packet';
import { MacField } from './MacField';

describe('Mac address field', () => {
    it('parse', () => {
        const p: any = {};
        const d = new Uint8Array([0, 0x0a, 0, 0, 0, 1]).buffer;
        const f = new MacField('data');
        f.parse(d, p as _Packet<{ data: number }>);

        expect(p['data']).toEqual('00:0a:00:00:00:01');
    });

    it('raw', () => {
        const p: any = { data: '00:0b:00:00:00:02' };
        let d = new ArrayBuffer(0);
        const f = new MacField('data');
        d = f.raw(d, p as _Packet<{ data: number }>);

        expect(new Uint8Array(d)).toEqual(new Uint8Array([0, 0x0b, 0, 0, 0, 2]));
    });

    it('repr', () => {
        const f = new MacField('data');
        expect(f.repr('00:00:00:00:00:01')).toEqual('00:00:00:00:00:01');
    });
});
