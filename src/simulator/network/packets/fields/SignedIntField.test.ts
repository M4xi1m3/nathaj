import { _Packet } from '../Packet';
import { SignedIntField } from './SignedIntField';

it('parse', () => {
    const p: any = {};
    const d = new Uint8Array([0xff, 0xff, 0xff, 0xff]).buffer;
    const f = new SignedIntField('data');
    f.parse(d, p as _Packet<{ data: number }>);

    expect(p['data']).toEqual(-1);
});

it('raw', () => {
    const p: any = { data: -2 };
    let d = new ArrayBuffer(0);
    const f = new SignedIntField('data');
    d = f.raw(d, p as _Packet<{ data: number }>);

    expect(new Uint8Array(d)).toEqual(new Uint8Array([0xff, 0xff, 0xff, 0xfe]));
});

it('repr', () => {
    const f = new SignedIntField('data');
    expect(f.repr(-1)).toEqual('-1');
});
