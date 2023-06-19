
import { _Packet } from './Packet';


/**
 * A field in a packet
 */
export abstract class Field {
    name: string
    constructor(name: string) {
        this.name = name;
    }

    /**
     * Concatenate two array buffers
     * @param {ArrayBuffer} a First buffer
     * @param {ArrayBuffer} b Second buffer
     * @returns {ArrayBuffer} A concatenated to b
     */
    protected static concatenate(a: ArrayBuffer, b: ArrayBuffer): ArrayBuffer {
        const tmp = new Uint8Array(a.byteLength + b.byteLength);
        tmp.set(new Uint8Array(a), 0);
        tmp.set(new Uint8Array(b), a.byteLength);
        return tmp.buffer;
    }

    /**
     * Parse the field
     * 
     * @param {ArrayBuffer} data Data to parse from
     * @param {_Packet} packet Packet to write the field to
     * @returns {ArrayBuffer} Remaining data
     */
    abstract parse(data: ArrayBuffer, packet: _Packet<any>): ArrayBuffer;

    /**
     * Get the field as binary data
     * 
     * @param {ArrayBuffer} data Buffer to append the data to
     * @param {_Packet} packet Packet to read the value from
     * @returns {ArrayBuffer} Buffer with the data appended to
     */
    abstract raw(data: ArrayBuffer, packet: _Packet<any>): ArrayBuffer;

    /**
     * Get a string representation of the field
     * 
     * @param {any} value Value to represent
     * @returns {string} String representation of the value
     */
    abstract repr(value: any): string;
}

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

/**
 * Unsigned byte field
 */
export class ByteField extends DataViewField {
    protected read = DataView.prototype.getUint8;
    protected write = DataView.prototype.setUint8;
    protected length = 1;
}

/**
 * Unsigned hexadecimal byte field
 */
export class XByteField extends ByteField {
    protected hex = true;
}

/**
 * Signed byte field
 */
export class SignedByteField extends DataViewField {
    protected read = DataView.prototype.getInt8;
    protected write = DataView.prototype.setInt8;
    protected length = 1;
}

/**
 * Unsigned 2 bytes integer field
 */
export class ShortField extends DataViewField {
    protected read = DataView.prototype.getUint16;
    protected write = DataView.prototype.setUint16;
    protected length = 2;
}

/**
 * Unsigned 2 bytes hexadecimal integer field
 */
export class XShortField extends ShortField {
    protected hex = true;
}

/**
 * Signed 2 bytes integer field
 */
export class SignedShortField extends DataViewField {
    protected read = DataView.prototype.getInt16;
    protected write = DataView.prototype.setInt16;
    protected length = 2;
}

/**
 * Unsigned 4 bytes integer field
 */
export class IntField extends DataViewField {
    protected read = DataView.prototype.getUint32;
    protected write = DataView.prototype.setUint32;
    protected length = 4;
}

/**
 * Unsigned 4 bytes integer hexadecimal field
 */
export class XIntField extends IntField {
    protected hex = true;
}

/**
 * Signed 4 bytes integer field
 */
export class SignedIntField extends DataViewField {
    protected read = DataView.prototype.getInt32;
    protected write = DataView.prototype.setInt32;
    protected length = 4;
}

/**
 * Single precision floating number field
 */
export class FloatField extends DataViewField {
    protected read = DataView.prototype.getFloat32;
    protected write = DataView.prototype.setFloat32;
    protected length = 4;
}

/**
 * Double precision floating point number field
 */
export class DoubleField extends DataViewField {
    protected read = DataView.prototype.getFloat64;
    protected write = DataView.prototype.setFloat64;
    protected length = 8;
}

/**
 * MAC address field
 */
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
