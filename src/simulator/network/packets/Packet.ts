
import { Field } from './Field';
import { Layer } from './Layer';

export class AnalysisItem {
    label: string;
    start: number;
    length: number;

    constructor(label: string, start: number, length: number) {
        this.label = label;
        this.start = start;
        this.length = length;
    }

    bounds(): [number, number] {
        return [this.start, this.start + this.length - 1];
    }
}

export class AnalysisTree extends AnalysisItem {
    items: (AnalysisTree | AnalysisItem)[];

    constructor(label: string, start: number, length: number) {
        super(label, start, length);
        this.items = [];
    }

    fits(start: number, length: number) {
        const end = start + length - 1;

        if (start < this.start || end > (this.start + this.length - 1)) {
            return false;
        }

        for (const [other_start, other_end] of this.items.map((v) => v.bounds())) {
            if (start <= other_end && end >= other_start)
                return true;
        }
        return false;
    }

    addItem(label: string, start: number, length: number): AnalysisItem | undefined {
        if (!this.fits(start + this.start, length)) {
            const item = new AnalysisItem(label, start + this.start, length);
            this.items.push(item);
            return item;
        } else {
            return undefined;
        }
    }

    addSubTree(label: string, start: number, length: number): AnalysisTree | undefined {
        if (!this.fits(start, length)) {
            const tree = new AnalysisTree(label, start + this.start, length);
            this.items.push(tree);
            return tree;
        } else {
            return undefined;
        }
    }
}

export class RootTree extends AnalysisTree {
    availableSpot() {
        let end = -1;
        for (const item of this.items) {
            end = Math.max(item.bounds()[1], end);
        }
        return end + 1;
    }

    addSubTree(label: string, start: number, length: number): AnalysisTree | undefined {
        return super.addSubTree(label, this.availableSpot(), length);
    }

    addItem(label: string, start: number, length: number): AnalysisItem | undefined {
        return super.addItem(label, this.availableSpot(), length);
    }

}

export class AnalyzedPacket {
    data: ArrayBuffer;
    id: number;
    time: number;
    origin: string;
    direction: string;
    dev: string;
    intf: string;

    source: string | null = null;
    destination: string | null = null;
    protocol: string | null = null;
    info: string | null = null;

    tree: RootTree;

    constructor(data: ArrayBuffer, id: number, time: number, dev: string, intf: string, direction: string) {
        this.data = data;
        this.id = id;
        this.time = time;
        this.dev = dev;
        this.intf = intf;
        this.origin = dev + "-" + intf;
        this.direction = direction;
        this.tree = new RootTree("Packet", 0, this.data.byteLength);
    }
}

export type Dissector<T> = (packet: _Packet<T> & T, analyzed: AnalyzedPacket) => void;

export class _Packet<T> {
    static proto: string;
    static fields: Field[];
    static dissector: Dissector<any>;
    next?: _Packet<any>;

    constructor(data?: { [key in keyof T]: any | ArrayBuffer }) {
        if (data !== undefined) {
            if (data instanceof ArrayBuffer) {
                this.parse(data);
            } else {
                for (const field of this.getFields()) {
                    if (field.name in data) {
                        (this as { [key: string]: any })[field.name] = (data as { [key: string]: any })[field.name];
                    } else {
                        (this as { [key: string]: any })[field.name] = undefined;
                    }
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
    new <T>(data?: T | ArrayBuffer): _Packet<T> & T
});
