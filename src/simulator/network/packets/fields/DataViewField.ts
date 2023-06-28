import { Buffers } from '../../../utils/Buffers';
import { Field } from '../Field';
import { _Packet } from '../Packet';

/**
 * Field which uses a DataView to work
 */
export class DataViewField extends Field {
    protected read = DataView.prototype.getUint8;
    protected write = DataView.prototype.setUint8;
    protected length = 1;
    protected hex = false;

    parse(data: ArrayBuffer, packet: _Packet<object>): ArrayBuffer {
        const dw = new DataView(data);
        (packet as { [key: string]: any })[this.name] = this.read.bind(dw)(0);
        return data.slice(this.length);
    }

    raw(data: ArrayBuffer, packet: _Packet<any>): ArrayBuffer {
        const arr = new ArrayBuffer(this.length);
        const dw = new DataView(arr);
        this.write.bind(dw)(0, (packet as { [key: string]: any })[this.name]);
        return Buffers.concatenate(data, arr);
    }

    repr(value: any): string {
        if (this.hex) return '0x' + value.toString(16).padStart(this.length * 2, '0');
        else return value.toString();
    }
}
