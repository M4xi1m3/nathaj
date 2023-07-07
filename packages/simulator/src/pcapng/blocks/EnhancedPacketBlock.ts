import { Buffers } from '../../utils/Buffers';
import { EpbFlags } from '../option/epb/EpbFlags';
import { OptComment } from '../option/opt/OptComment';
import { PcapngOptions } from '../option/PcapngOptions';
import { PcapngBlock } from './PcapngBlock';

export type EnhancedPacketOptions = EpbFlags | OptComment;

export class EnhancedPacketBlock extends PcapngBlock {
    public readonly options = new PcapngOptions<EnhancedPacketOptions>();

    public readonly interface_id: number;
    public readonly timestamp: bigint;
    public readonly data: ArrayBuffer;
    public readonly original_length: number;

    constructor(data: ArrayBuffer, timestamp: bigint, interface_id = 0, original_length = data.byteLength) {
        super();
        this.data = data;
        this.timestamp = timestamp;
        this.interface_id = interface_id;
        this.original_length = original_length;
    }

    get type() {
        return 0x00000006;
    }

    get body() {
        const body = new ArrayBuffer(20);
        const dw = new DataView(body);

        dw.setUint32(0, this.interface_id);
        dw.setBigUint64(4, this.timestamp);
        dw.setUint32(12, this.data.byteLength);
        dw.setUint32(16, this.original_length);

        return Buffers.concatenate(
            Buffers.concatenate(
                body,
                Buffers.concatenate(this.data, new ArrayBuffer((4 - (this.data.byteLength % 4)) % 4))
            ),
            this.options.raw()
        );
    }
}
