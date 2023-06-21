import { _Packet } from '../Packet';
import { ByteField } from './ByteField';

it('parse', () => {
    const p: any = {};
    const d = new Uint8Array([5]).buffer;
    const f = new ByteField('data');
    f.parse(d, p as _Packet<{ data: number }>);

    expect(p['data']).toEqual(5);
});

it('raw', () => {
    const p: any = { data: 10 };
    let d = new ArrayBuffer(0);
    const f = new ByteField('data');
    d = f.raw(d, p as _Packet<{ data: number }>);

    expect(new Uint8Array(d)).toEqual(new Uint8Array([10]));
});

it('repr', () => {
    const f = new ByteField('data');
    expect(f.repr(15)).toEqual('15');
});
