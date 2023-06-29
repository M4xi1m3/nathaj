import { Buffers } from '../../../utils/Buffers';
import { CRC32 } from '../../../utils/CRC32';
import { Field } from '../Field';
import { _Packet } from '../Packet';

/**
 * Ethernet CRC field
 */
export class FCSField extends Field {
    constructor(name: string) {
        super(name);
    }

    parse(data: ArrayBuffer, position: number, packet: _Packet<any>): ArrayBuffer {
        const dw = new DataView(data);

        (packet as { [key: string]: any })[this.name] = dw.getUint32(0);
        return data.slice(4);
    }

    raw(data: ArrayBuffer, packet: _Packet<any>): ArrayBuffer {
        packet;
        const buf = new Uint32Array([CRC32.buff(CRC32.reverse(0x04c11db7), data)]);
        return Buffers.concatenate(data, buf.buffer);
    }

    repr(value: any): string {
        return '0x' + value.toString(16);
    }
}
