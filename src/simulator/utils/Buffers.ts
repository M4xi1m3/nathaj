export class Buffers {
    /**
     * Concatenate two array buffers
     * @param {ArrayBuffer} a First buffer
     * @param {ArrayBuffer} b Second buffer
     * @returns {ArrayBuffer} A concatenated to b
     */
    public static concatenate(a: ArrayBuffer, b: ArrayBuffer): ArrayBuffer {
        const tmp = new Uint8Array(a.byteLength + b.byteLength);
        tmp.set(new Uint8Array(a), 0);
        tmp.set(new Uint8Array(b), a.byteLength);
        return tmp.buffer;
    }

    /**
     * Get the content of an array buffer as an hexadecimal string
     *
     * @param {ArrayBuffer} buffer Buffer to convert
     * @returns {string} Hex string representing the content of the buffer
     */
    public static hex(buffer: ArrayBuffer): string {
        return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, '0')).join('');
    }
}
