
import { Field } from './Field';
import { Layer } from './Layer';

export class _Packet<T> {
    static proto: string;
    static fields: Field[];
    next?: _Packet<any>;

    constructor(data?: {[key in keyof T]: any}) {
        if (data !== undefined) {
            for (const field of this.getFields()) {
                if (field.name in data) {
                    (this as {[key: string]: any})[field.name] = (data as {[key: string]: any})[field.name];
                } else {
                    (this as {[key: string]: any})[field.name] = undefined;
                }
            }
        }
    }

    getFields(): Field[] {
        return (this.constructor as typeof _Packet).fields;
    }

    getProto(): string {
        return (this.constructor as typeof _Packet).proto;
    }

    parse(data: ArrayBuffer): ArrayBuffer {
        for (const field of this.getFields()) {
            data = field.parse(data, this);
        }

        const next = Layer.apply(this);
        if (next !== undefined) {
            this.next = new next();
            data = this.next.parse(data);
        }

        return data;
    }

    show() {
        let str = "";
        str += " === " + this.getProto() + " ===\n";
        for (const field of this.getFields()) {
            str += "  - " + field.name + ": " + field.repr((this as {[key: string]: any})[field.name]) + "\n";
        }
        if (this.next !== undefined)
            str += this.next.show();
        return str;
    }

    raw(buffer: ArrayBuffer = new ArrayBuffer(0)): ArrayBuffer {
        for (const field of this.getFields()) {
            buffer = field.raw(buffer, this);
        }
        
        if (this.next !== undefined)
            buffer = this.next.raw(buffer);

        return buffer;
    }

    setNext(next: _Packet<object>): _Packet<object> {
        this.next = next;
        return next;
    }
}

export const Packet = _Packet as ({
    new <T>(data?: T): _Packet<T> & T
});
