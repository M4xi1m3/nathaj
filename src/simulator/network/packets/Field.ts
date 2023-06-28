import { _Packet } from './Packet';

/**
 * A field in a packet
 */
export abstract class Field {
    name: string;
    constructor(name: string) {
        this.name = name;
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
