import { PcapngOption } from '../PcapngOption';

/**
 * Length of the FCS
 */
export class IfFscLen extends PcapngOption {
    public readonly fcs_len: number;

    constructor(fcs_len: number) {
        super();

        this.fcs_len = fcs_len;
    }

    get code() {
        return 13;
    }
    get name() {
        return 'if_fsclen';
    }
    get value(): ArrayBuffer {
        const data = new ArrayBuffer(1);
        const dw = new DataView(data);
        dw.setUint8(0, this.fcs_len);
        return data;
    }
}
