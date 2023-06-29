import { describe, expect, it } from 'vitest';
import { IfDescription } from '../option/if/IfDescription';
import { IfIPv4Address } from '../option/if/IfIPv4Address';
import { IfMacAddr } from '../option/if/IfMacAddr';
import { IfName } from '../option/if/IfName';
import { InterfaceBlock } from './InterfaceBlock';

describe('interface block', () => {
    it('raw', () => {
        const block = new InterfaceBlock();
        block.options.push(
            new IfName('eth0'),
            new IfMacAddr('00:0a:00:00:00:01'),
            new IfIPv4Address('192.168.1.1'),
            new IfDescription('Lorem ipsum')
        );

        expect(new Uint8Array(block.raw())).toStrictEqual(
            new Uint8Array([
                0, 0, 0, 1, 0, 0, 0, 68, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 4, 101, 116, 104, 48, 0, 6, 0, 6, 0, 10, 0, 0,
                0, 1, 0, 0, 0, 4, 0, 4, 192, 168, 1, 1, 0, 3, 0, 11, 76, 111, 114, 101, 109, 32, 105, 112, 115, 117,
                109, 0, 0, 0, 0, 0, 0, 0, 0, 68,
            ])
        );
    });
});
