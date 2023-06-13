
import { Field } from './Field';
import { Layer } from './Layer';

export class AnalyzedPacket {
    id: number;
    time: number;
    origin: string;
    direction: string;

    source: string | null = null;
    destination: string | null = null;
    protocol: string | null = null;
    info: string | null = null;

    constructor(id: number, time: number, origin: string, direction: string) {
        this.id = id;
        this.time = time;
        this.origin = origin;
        this.direction = direction;
    }
}

export type Dissector<T> = (packet: _Packet<T> & T, analyzed: AnalyzedPacket) => void;

export class _Packet<T> {
    static proto: string;
    static fields: Field[];
    static dissector: Dissector<any>;
    next?: _Packet<any>;

    constructor(data?: { [key in keyof T]: any }) {
        if (data !== undefined) {
            for (const field of this.getFields()) {
                if (field.name in data) {
                    (this as { [key: string]: any })[field.name] = (data as { [key: string]: any })[field.name];
                } else {
                    (this as { [key: string]: any })[field.name] = undefined;
                }
            }
        }
    }

    getFields(): Field[] {
        return (this.constructor as typeof _Packet).fields;
    }

    getDissector(): Dissector<any> {
        return (this.constructor as typeof _Packet).dissector;
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

    dissect(analyzed: AnalyzedPacket): AnalyzedPacket {
        this.getDissector()(this, analyzed);

        if (this.next !== undefined) {
            this.next.dissect(analyzed);
        }

        return analyzed;
    }

    show() {
        let str = "";
        str += " === " + this.getProto() + " ===\n";
        for (const field of this.getFields()) {
            str += "  - " + field.name + ": " + field.repr((this as { [key: string]: any })[field.name]) + "\n";
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
