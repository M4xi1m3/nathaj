
import { _Packet } from './Packet';

export abstract class Field {
    name: string
    constructor(name: string) {
        this.name = name;
    }

    protected static concatenate(a: ArrayBuffer, b: ArrayBuffer): ArrayBuffer {
        const tmp = new Uint8Array(a.byteLength + b.byteLength);
        tmp.set(new Uint8Array(a), 0);
        tmp.set(new Uint8Array(b), a.byteLength);
        return tmp.buffer;
    }

    abstract parse(data: ArrayBuffer, packet: _Packet<any>): ArrayBuffer;
    abstract raw(data: ArrayBuffer, packet: _Packet<any>): ArrayBuffer;
    abstract repr(value: any): string;
}

export class DataViewField extends Field {
    read = DataView.prototype.getUint8;
    write = DataView.prototype.setUint8;
    length = 1;
    hex = false;

    parse(data: ArrayBuffer, packet: _Packet<object>): ArrayBuffer {
        const dw = new DataView(data);
        (packet as {[key: string]: any})[this.name] = this.read.bind(dw)(0);
        return data.slice(this.length);
    }

    raw(data: ArrayBuffer, packet: _Packet<any>): ArrayBuffer {
        const arr = new ArrayBuffer(this.length);
        const dw = new DataView(arr);
        this.write.bind(dw)(0, (packet as {[key: string]: any})[this.name]);
        return Field.concatenate(data, arr);
    }

    repr(value: any): string {
        if (this.hex)
            return "0x" + value.toString(16).padStart(this.length * 2, '0');
        else
            return value.toString();
    }
}

export class ByteField extends DataViewField {
    read = DataView.prototype.getUint8;
    write = DataView.prototype.setUint8;
    length = 1;
}

export class XByteField extends ByteField {
    hex = true;
}

export class SignedByteField extends DataViewField {
    read = DataView.prototype.getInt8;
    write = DataView.prototype.setInt8;
    length = 1;
}

export class ShortField extends DataViewField {
    read = DataView.prototype.getUint16;
    write = DataView.prototype.setUint16;
    length = 2;
}

export class XShortField extends ShortField {
    hex = true;
}

export class SignedShortField extends DataViewField {
    read = DataView.prototype.getInt16;
    write = DataView.prototype.setInt16;
    length = 2;
}

export class IntField extends DataViewField {
    read = DataView.prototype.getUint32;
    write = DataView.prototype.setUint32;
    length = 4;
}

export class XIntField extends IntField {
    hex = true;
}

export class SignedIntField extends DataViewField {
    read = DataView.prototype.getInt32;
    write = DataView.prototype.setInt32;
    length = 4;
}

export class FloatField extends DataViewField {
    read = DataView.prototype.getFloat32;
    write = DataView.prototype.setFloat32;
    length = 4;
}

export class DoubleField extends DataViewField {
    read = DataView.prototype.getFloat64;
    write = DataView.prototype.setFloat64;
    length = 8;
}

export class MacField extends Field {
    parse(data: ArrayBuffer, packet: _Packet<any>): ArrayBuffer {
        const dw = new DataView(data);
        const digits = [];
        for (let i = 0; i < 6; i++)
            digits.push(dw.getUint8(i).toString(16).padStart(2, '0'));

        (packet as {[key: string]: any})[this.name] = digits.join(":")
        return data.slice(6);
    }

    raw(data: ArrayBuffer, packet: _Packet<any>): ArrayBuffer {
        const arr = new ArrayBuffer(6);
        const dw = new DataView(arr);

        ((packet as {[key: string]: any})[this.name] as string).split(":").forEach((v: string, k: number) => {
            dw.setUint8(k, parseInt(v, 16));
        });

        return Field.concatenate(data, arr);
    }

    repr(value: any): string {
        return value.toString();
    }
}
