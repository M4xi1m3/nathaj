import { Buffers } from '../../../utils/Buffers';
import { Field } from '../Field';
import { _Packet } from '../Packet';

/**
 * Padding field
 */
export class PaddingField extends Field {
    public readonly total_length: number;

    constructor(name: string, total_length: number) {
        super(name);
        this.total_length = total_length;
    }

    parse(data: ArrayBuffer, position: number, packet: _Packet<any>): ArrayBuffer {
        (packet as { [key: string]: any })[this.name] = data.slice(0, Math.max(0, this.total_length - position));
        return data.slice(Math.max(0, this.total_length - position));
    }

    raw(data: ArrayBuffer, packet: _Packet<any>): ArrayBuffer {
        packet;
        return Buffers.concatenate(data, new ArrayBuffer(Math.max(0, this.total_length - data.byteLength)));
    }

    repr(value: any): string {
        return Buffers.hex(value);
    }
}
