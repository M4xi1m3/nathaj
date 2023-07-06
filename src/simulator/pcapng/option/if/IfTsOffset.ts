import { PcapngOption } from '../PcapngOption';

/**
 * Offset of the timestamps of the interface (in seconds)
 */
export class IfTsOffset extends PcapngOption {
    public readonly offset: bigint;

    constructor(offset: bigint) {
        super();

        this.offset = offset;
    }

    get code() {
        return 14;
    }
    get name() {
        return 'if_tsoffset';
    }
    get value(): ArrayBuffer {
        const data = new ArrayBuffer(8);
        const dw = new DataView(data);
        dw.setBigInt64(0, this.offset);
        return data;
    }
}
