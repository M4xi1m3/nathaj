export class CRC32 {
    private static generate(reversedPolynomial: number): number[] {
        const table = [];
        let i, j, n;

        for (i = 0; i < 256; i++) {
            n = i;
            for (j = 8; j > 0; j--) {
                if ((n & 1) == 1) {
                    n = (n >>> 1) ^ reversedPolynomial;
                } else {
                    n = n >>> 1;
                }
            }
            table[i] = n;
        }

        return table;
    }

    private static initial() {
        return 0xffffffff;
    }

    private static addByte(table: number[], crc: number, byte: number): number {
        crc = (crc >>> 8) ^ table[byte ^ (crc & 0x000000ff)];
        return crc;
    }

    private static final(crc: number): number {
        crc = ~crc;
        crc = crc < 0 ? 0xffffffff + crc + 1 : crc;
        return crc;
    }

    public static str(reversedPolynomial: number, str: string): number {
        const table = CRC32.generate(reversedPolynomial);
        let crc = 0;
        let i;

        crc = CRC32.initial();

        for (i = 0; i < str.length; i++) crc = CRC32.addByte(table, crc, str.charCodeAt(i));

        crc = CRC32.final(crc);
        return crc;
    }

    public static buff(reversedPolynomial: number, data: ArrayBuffer): number {
        const dataView = new DataView(data);
        const table = CRC32.generate(reversedPolynomial);
        let crc = 0;
        let i;

        crc = CRC32.initial();

        for (i = 0; i < dataView.byteLength; i++) crc = CRC32.addByte(table, crc, dataView.getUint8(i));

        crc = CRC32.final(crc);
        return crc;
    }

    public static reverse(polynomial: number): number {
        let reversedPolynomial = 0;

        for (let i = 0; i < 32; i++) {
            reversedPolynomial = reversedPolynomial << 1;
            reversedPolynomial = reversedPolynomial | ((polynomial >>> i) & 1);
        }

        return reversedPolynomial;
    }

    public static ethernet(data: ArrayBuffer): ArrayBuffer {
        const buf = new ArrayBuffer(4);
        const dw = new DataView(buf);
        dw.setUint32(0, CRC32.buff(CRC32.reverse(0x04c11db7), data), true);
        return buf;
    }
}
