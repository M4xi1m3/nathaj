import { describe, expect, it } from 'vitest';
import { EpbFlags, FlagDirection, FlagReceptionType } from './EpbFlags';

describe('epb flags', () => {
    it('raw', () => {
        const flags = new EpbFlags(FlagDirection.Outbound, FlagReceptionType.Unicast, 4);

        expect(new Uint8Array(flags.raw())).toStrictEqual(new Uint8Array([0, 2, 0, 4, 0, 0, 0, 0b10000110]));
    });
});
