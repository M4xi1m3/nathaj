import { Field } from './Field';

it('field concatenate', () => {
    const a = new Uint8Array([0, 1]).buffer;
    const b = new Uint8Array([2, 3, 4]).buffer;

    const c = Field['concatenate'](a, b);

    expect(new Uint8Array(c)).toEqual(new Uint8Array([0, 1, 2, 3, 4]));
});
