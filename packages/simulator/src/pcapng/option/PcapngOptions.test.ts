import { describe, expect, it } from 'vitest';
import { PcapngOption } from './PcapngOption';
import { PcapngOptions } from './PcapngOptions';

export class OptDummy extends PcapngOption {
    get value(): ArrayBuffer {
        return new Uint8Array([0xca, 0xfe]).buffer;
    }
    get code() {
        return 1;
    }
    get name() {
        return 'opt_dummy';
    }
}

describe('pcap options', () => {
    it('raw option', () => {
        const opt = new PcapngOptions<OptDummy>();
        opt.push(new OptDummy());

        expect(new Uint8Array(opt.raw())).toStrictEqual(new Uint8Array([0, 1, 0, 2, 0xca, 0xfe, 0, 0, 0, 0, 0, 0]));
    });

    it('raw empty', () => {
        const opt = new PcapngOptions<OptDummy>();

        expect(new Uint8Array(opt.raw())).toStrictEqual(new Uint8Array([]));
    });
});
