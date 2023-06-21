import { _Packet } from '../Packet';
import { DoubleField } from './DoubleField';

it('parse', () => {
    const p: any = {};
    const d = new Uint8Array([63, 224, 0, 0, 0, 0, 0, 0]).buffer;
    const f = new DoubleField('data');
    f.parse(d, p as _Packet<{ data: number }>);

    expect(p['data']).toEqual(0.5);
});

it('raw', () => {
    const p: any = { data: 0.5 };
    let d = new ArrayBuffer(0);
    const f = new DoubleField('data');
    d = f.raw(d, p as _Packet<{ data: number }>);

    expect(new Uint8Array(d)).toEqual(new Uint8Array([63, 224, 0, 0, 0, 0, 0, 0]));
});

it('repr', () => {
    const f = new DoubleField('data');
    expect(f.repr(0.5)).toEqual('0.5');
});
