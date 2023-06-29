import { PcapngOption } from '../PcapngOption';

/**
 * Resolution of the timestamps of the interface
 */
export class IfTsResol extends PcapngOption {
    public readonly resolution: number;

    constructor(resolution: number) {
        super();

        this.resolution = resolution;
    }

    get code() {
        return 9;
    }
    get name() {
        return 'if_tsresol';
    }
    get value(): ArrayBuffer {
        const data = new ArrayBuffer(1);
        const dw = new DataView(data);
        dw.setInt8(0, this.resolution);
        return data;
    }
}
