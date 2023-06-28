import { Buffers } from '../../utils/Buffers';
import { Mac } from '../../utils/Mac';
import { Field } from '../Field';
import { _Packet } from '../Packet';

/**
 * MAC address field
 */
export class MacField extends Field {
    parse(data: ArrayBuffer, packet: _Packet<any>): ArrayBuffer {
        (packet as { [key: string]: any })[this.name] = Mac.fromBuffer(data);
        return data.slice(6);
    }

    raw(data: ArrayBuffer, packet: _Packet<any>): ArrayBuffer {
        return Buffers.concatenate(data, Mac.toBuffer((packet as { [key: string]: any })[this.name] as string));
    }

    repr(value: any): string {
        return value.toString();
    }
}
