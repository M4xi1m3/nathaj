
import { PacketDirection } from '../Network';
import { Field } from './Field';
import { Layer } from './Layer';

/**
 * Analyzed packet tree item
 */
export class AnalysisItem {
    /**
     * Label of the item
     */
    public label: string;

    /**
     * Start index in the data
     */
    public start: number;

    /**
     * Length
     */
    public length: number;

    public constructor(label: string, start: number, length: number) {
        this.label = label;
        this.start = start;
        this.length = length;
    }

    /**
     * Get the start and end position in the data
     * 
     * @returns {[number, number]} Start and end positions
     */
    public bounds(): [number, number] {
        return [this.start, this.start + this.length - 1];
    }
}

/**
 * Analyzed packet tree
 */
export class AnalysisTree extends AnalysisItem {
    items: (AnalysisTree | AnalysisItem)[];

    constructor(label: string, start: number, length: number) {
        super(label, start, length);
        this.items = [];
    }

    /**
     * Check if an item fits in that tree
     * 
     * @param {number} start Start position to check
     * @param {number} length Length to check
     * @returns {boolean} True if it fits, false otherwise
     */
    private fits(start: number, length: number) {
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

    /**
     * Add an item to the tree
     * 
     * @param {string} label Label of the item
     * @param {number} start Start position of the item
     * @param {number} length Length of the item
     * @returns {AnalysisItem | undefined} The new item, or undefined if it didn't fit
     */
    public addItem(label: string, start: number, length: number): AnalysisItem | undefined {
        if (!this.fits(start + this.start, length)) {
            const item = new AnalysisItem(label, start + this.start, length);
            this.items.push(item);
            return item;
        } else {
            return undefined;
        }
    }

    /**
     * Add a sub tree to the tree
     * 
     * @param {string} label Label of the sub tree
     * @param {number} start Start position of the sub tree
     * @param {number} length Length of the sub tree
     * @returns {AnalysisTree | undefined} The new sub tree, or undefined if it didn't fit
     */
    public addSubTree(label: string, start: number, length: number): AnalysisTree | undefined {
        if (!this.fits(start, length)) {
            const tree = new AnalysisTree(label, start + this.start, length);
            this.items.push(tree);
            return tree;
        } else {
            return undefined;
        }
    }
}

/**
 * Root of the analyzed tree
 */
export class RootTree extends AnalysisTree {
    /**
     * Get the next available spot
     * 
     * @returns {number} The next available spot
     */
    private availableSpot() {
        let end = -1;
        for (const item of this.items) {
            end = Math.max(item.bounds()[1], end);
        }
        return end + 1;
    }

    public addSubTree(label: string, start: number, length: number): AnalysisTree | undefined {
        return super.addSubTree(label, this.availableSpot(), length);
    }

    public addItem(label: string, start: number, length: number): AnalysisItem | undefined {
        return super.addItem(label, this.availableSpot(), length);
    }

}

/**
 * A packet that has been dissected
 */
export class AnalyzedPacket {
    /**
     * Data of the packet
     */
    public data: ArrayBuffer;

    /**
     * ID of the packet
     */
    public id: number;

    /**
     * Time the packet has been handled
     */
    public time: number;

    /**
     * Origin of the packet
     */
    public origin: string;

    /**
     * Direction of the packet
     */
    public direction: PacketDirection;

    /**
     * Device the packet comes from
     */
    public dev: string;

    /**
     * Interface the packet comes from
     */
    public intf: string;


    /**
     * Source address
     */
    public source: string | null = null;

    /**
     * Destionation address
     */
    public destination: string | null = null;

    /**
     * Protocol name
     */
    public protocol: string | null = null;


    /**
     * Complementary information
     */
    public info: string | null = null;


    /**
     * Analyzed packet tree
     */
    public tree: RootTree;

    constructor(data: ArrayBuffer, id: number, time: number, dev: string, intf: string, direction: PacketDirection) {
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

/**
 * Dissector function definition
 */
export type Dissector<T> = (packet: _Packet<T> & T, analyzed: AnalyzedPacket) => void;

/**
 * Packet class
 */
export class _Packet<T> {
    /**
     * Name of the protocol
     */
    public static readonly proto: string;

    /**
     * List of fields in the packet
     */
    public static readonly fields: Field[];

    /**
     * Function used to dissect the packet
     */
    public static readonly dissector: Dissector<any>;

    private next?: _Packet<any>;

    /**
     * Create a packet
     * 
     * @param {undefined | object | ArrayBuffer} data Data to create the packet from.
     */
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

    /**
     * Get the fields list
     * 
     * @returns {Field[]} Packet's field list
     */
    public getFields(): Field[] {
        return (this.constructor as typeof _Packet).fields;
    }

    /**
     * Get the dissector
     * 
     * @returns {Dissector} Packet's dissector
     */
    public getDissector(): Dissector<any> {
        return (this.constructor as typeof _Packet).dissector;
    }

    /**
     * Get the protocol's name
     * 
     * @returns {string} Name of the protocol
     */
    public getProto(): string {
        return (this.constructor as typeof _Packet).proto;
    }

    /**
     * Parse the packet from binary data
     * 
     * @param {ArrayBuffer} data Data to parse
     * @returns {ArrayBuffer} Remaining data
     */
    public parse(data: ArrayBuffer): ArrayBuffer {
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

    /**
     * Dissect the packet
     * 
     * @param {AnalyzedPacket} analyzed Analyzed packet input
     * @returns {AnalyzedPacket} Dissected packet
     */
    public dissect(analyzed: AnalyzedPacket): AnalyzedPacket {
        this.getDissector()(this, analyzed);

        if (this.next !== undefined) {
            this.next.dissect(analyzed);
        }

        return analyzed;
    }

    /**
     * Transforms the packet to raw binary data
     * 
     * @param {ArrayBuffer} [buffer] Existing buffer to append to (creates if not provided)
     * @returns {ArrayBuffer} Raw data
     */
    public raw(buffer: ArrayBuffer = new ArrayBuffer(0)): ArrayBuffer {
        for (const field of this.getFields()) {
            buffer = field.raw(buffer, this);
        }

        if (this.next !== undefined)
            buffer = this.next.raw(buffer);

        return buffer;
    }

    /**
     * Sets the next packet in the packet
     * 
     * @param {Packet} next Next packet
     * @returns {Packet} Next packet
     */
    public setNext(next: _Packet<object>): _Packet<object> {
        this.next = next;
        return next;
    }

    /**
     * Get the next packet
     * 
     * @returns {Packet} Next packet 
     */
    public getNext() {
        return this.next;
    }
}

/**
 * Packet class
 */
export const Packet = _Packet as ({
    new <T>(data?: T | ArrayBuffer): _Packet<T> & T
});
