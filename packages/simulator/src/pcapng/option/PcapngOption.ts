import { Buffers } from '../../utils/Buffers';

export abstract class PcapngOption {
    abstract get code(): number;
    abstract get name(): string;
    abstract get value(): ArrayBuffer;

    public raw(): ArrayBuffer {
        const value = this.value;

        const data = new ArrayBuffer(4);
        const dw = new DataView(data);

        dw.setUint16(0, this.code);
        dw.setUint16(2, value.byteLength);

        return Buffers.concatenate(data, Buffers.concatenate(value, new ArrayBuffer((4 - (value.byteLength % 4)) % 4)));
    }
}
