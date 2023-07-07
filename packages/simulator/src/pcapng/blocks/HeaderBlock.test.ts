import { describe, expect, it } from 'vitest';
import { ShbHardware } from '../option/shb/ShbHardware';
import { ShbOS } from '../option/shb/ShbOS';
import { ShbUserAppl } from '../option/shb/ShbUserAppl';
import { HeaderBlock } from './HeaderBlock';

describe('header block', () => {
    it('raw', () => {
        const block = new HeaderBlock();
        block.options.push(new ShbHardware('Hardware'), new ShbOS('OS'), new ShbUserAppl('App'));

        expect(new Uint8Array(block.raw())).toStrictEqual(
            new Uint8Array([
                0x0a, 0x0d, 0x0d, 0x0a, 0, 0, 0, 60, 0x1a, 0x2b, 0x3c, 0x4d, 0, 1, 0, 0, 0xff, 0xff, 0xff, 0xff, 0xff,
                0xff, 0xff, 0xff, 0, 2, 0, 8, 72, 97, 114, 100, 119, 97, 114, 101, 0, 3, 0, 2, 79, 83, 0, 0, 0, 4, 0, 3,
                65, 112, 112, 0, 0, 0, 0, 0, 0, 0, 0, 60,
            ])
        );
    });
});
