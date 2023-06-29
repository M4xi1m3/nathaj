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
}
