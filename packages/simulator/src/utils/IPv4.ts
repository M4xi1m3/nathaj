const ipv4Regexp = new RegExp(
    '^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
);

export class InvalidIPV4Exception extends Error {
    i18n: string;
    i18nargs: any;

    constructor(ipv4: string) {
        super('Invalid ipv4 address ' + ipv4 + '.');

        this.i18n = 'exception.ipv4.invalid';
        this.i18nargs = { address: ipv4 };
    }
}

export class IPv4 {
    /**
     * Convert the ipv4 address to an int
     *
     * @param {string} ipv4 IPv4 to convert
     * @returns {bigint} Integer representation of the address
     */
    public static toInt(ipv4: string): bigint {
        if (IPv4.isValid(ipv4, true)) {
            const d = ipv4.split('.');
            return (BigInt(d[0]) << 24n) | (BigInt(d[1]) << 16n) | (BigInt(d[2]) << 8n) | BigInt(d[3]);
        }
    }

    /**
     * Convert the int to a ipv4 address
     *
     * @param  {bigint} ipv4 Int to convert
     * @returns {string} IPv4 address
     */
    public static fromInt(ipv4: bigint): string {
        let d = '' + (ipv4 % 256n);
        for (let i = 3; i > 0; i--) {
            ipv4 /= 256n;
            d = (ipv4 % 256n) + '.' + d;
        }
        return d;
    }

    /**
     * Convert a buffer to a ipv4 address
     *
     * @param {ArrayBuffer} data Data to read a ipv4 address from
     * @returns {string} IPv4 address
     */
    public static fromBuffer(data: ArrayBuffer): string {
        if (data.byteLength < 4) {
            throw new RangeError();
        }

        const dw = new DataView(data);
        const digits = [];
        for (let i = 0; i < 4; i++) digits.push(dw.getUint8(i));

        return digits.join('.');
    }

    /**
     * Convert a ipv4 addres to a buffer
     *
     * @param {string} ipv4 IPv4 to convert
     * @returns {ArrayBuffer} Converted buffer
     */
    public static toBuffer(ipv4: string): ArrayBuffer {
        IPv4.isValid(ipv4, true);

        const arr = new ArrayBuffer(4);
        const dw = new DataView(arr);

        ipv4.split('.').forEach((v: string, k: number) => {
            dw.setUint8(k, parseInt(v));
        });

        return arr;
    }

    /**
     * Check if a ipv4 address is valid
     *
     * @param {string} ipv4 IPv4 address to check
     * @param {boolean} throwException If true, an exception is thrown if the address is invalid
     * @returns {boolean} True if the interface is valid, false otherwise
     */
    public static isValid(ipv4: string, throwException = false) {
        const valid = ipv4Regexp.test(ipv4);

        if (throwException && !valid) {
            throw new InvalidIPV4Exception(ipv4);
        }

        return valid;
    }
}
