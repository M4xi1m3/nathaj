import { _Packet } from '../Packet';
import { XIntField } from './XIntField';

it('parse', () => {
    const p: any = {};
    const d = new Uint8Array([0, 0, 0, 5]).buffer;
    const f = new XIntField('data');
    f.parse(d, p as _Packet<{ data: number }>);

    expect(p['data']).toEqual(5);
});

it('raw', () => {
    const p: any = { data: 10 };
    let d = new ArrayBuffer(0);
    const f = new XIntField('data');
    d = f.raw(d, p as _Packet<{ data: number }>);

    expect(new Uint8Array(d)).toEqual(new Uint8Array([0, 0, 0, 10]));
});

it('repr', () => {
    const f = new XIntField('data');
    expect(f.repr(15)).toEqual('0x0000000f');
});
