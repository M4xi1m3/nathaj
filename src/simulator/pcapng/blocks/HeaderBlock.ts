import { Buffers } from '../../utils/Buffers';
import { OptComment } from '../option/opt/OptComment';
import { PcapngOptions } from '../option/PcapngOptions';
import { ShbHardware } from '../option/shb/ShbHardware';
import { ShbOS } from '../option/shb/ShbOS';
import { ShbUserAppl } from '../option/shb/ShbUserAppl';
import { InterfaceBlock } from './InterfaceBlock';
import { PcapngBlock } from './PcapngBlock';

export type HeaderOptions = ShbHardware | ShbOS | ShbUserAppl | OptComment;

export class HeaderBlock extends PcapngBlock {
    public readonly options = new PcapngOptions<HeaderOptions>();
    public readonly interfaces: { [name: string]: InterfaceBlock } = {};
    private last_intf_id = 0;

    public addInterface(name: string): InterfaceBlock {
        const intf = new InterfaceBlock(this.last_intf_id);
        this.interfaces[name] = intf;
        this.last_intf_id++;
        return intf;
    }

    get type() {
        return 0x0a0d0d0a;
    }

    get body() {
        const body = new ArrayBuffer(16);
        const dw = new DataView(body);

        dw.setUint32(0, 0x1a2b3c4d);
        dw.setUint16(4, 1);
        dw.setUint16(6, 0);
        // TODO: Set the section length correctly
        dw.setBigInt64(8, -1n);

        return Buffers.concatenate(body, this.options.raw());
    }
}
