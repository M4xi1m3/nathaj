import { Field } from '../Field';
import { _Packet } from '../Packet';

/**
 * MAC address field
 */
export class MacField extends Field {
    parse(data: ArrayBuffer, packet: _Packet<any>): ArrayBuffer {
        const dw = new DataView(data);
        const digits = [];
        for (let i = 0; i < 6; i++) digits.push(dw.getUint8(i).toString(16).padStart(2, '0'));

        (packet as { [key: string]: any })[this.name] = digits.join(':');
        return data.slice(6);
    }

    raw(data: ArrayBuffer, packet: _Packet<any>): ArrayBuffer {
        const arr = new ArrayBuffer(6);
        const dw = new DataView(arr);

        ((packet as { [key: string]: any })[this.name] as string).split(':').forEach((v: string, k: number) => {
            dw.setUint8(k, parseInt(v, 16));
        });

        return Field.concatenate(data, arr);
    }

    repr(value: any): string {
        return value.toString();
    }
}
