import { Buffers } from '../../../utils/Buffers';
import { Field } from '../Field';
import { _Packet } from '../Packet';

/**
 * Will be filled with the length of the payload
 */
export class LenField extends Field {
    constructor(name: string) {
        super(name);
    }

    parse(data: ArrayBuffer, position: number, packet: _Packet<any>): ArrayBuffer {
        const dw = new DataView(data);

        (packet as { [key: string]: any })[this.name] = dw.getUint16(0);
        return data.slice(2);
    }

    raw(data: ArrayBuffer, packet: _Packet<any>): ArrayBuffer {
        const d = new ArrayBuffer(2);
        const dw = new DataView(d);
        dw.setUint16(0, packet.getNext().raw().byteLength);

        return Buffers.concatenate(data, d);
    }

    repr(value: any): string {
        return '0x' + value.toString(16);
    }
}
