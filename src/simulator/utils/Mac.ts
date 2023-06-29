const macRegexp = new RegExp('^(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$');

export class InvalidMACException extends Error {
    constructor(mac: string) {
        super('Invalid mac address ' + mac + '.');
    }
}

export class Mac {
    /**
     * Convert the mac address to an int
     *
     * @param {string} mac Mac to convert
     * @returns {bigint} Integer representation of the address
     */
    public static toInt(mac: string): bigint {
        if (Mac.isValid(mac, false, true)) {
            const bytes = mac.split(':');
            let out = 0n;

            for (let i = 0; i < 6; i++) {
                out |= BigInt(parseInt(bytes[i], 16)) << (40n - 8n * BigInt(i));
            }

            return out;
        }
    }

    /**
     * Convert the int to a mac address
     *
     * @param  {bigint} mac Int to convert
     * @returns {string} Mac address
     */
    public static fromInt(mac: bigint): string {
        return mac
            .toString(16)
            .padStart(12, '0')
            .match(/.{1,2}/g)
            .join(':');
    }

    /**
     * Convert a buffer to a mac address
     *
     * @param {ArrayBuffer} data Data to read a mac address from
     * @returns {string} Mac address
     */
    public static fromBuffer(data: ArrayBuffer): string {
        if (data.byteLength < 6) {
            throw new RangeError();
        }

        const dw = new DataView(data);
        const digits = [];
        for (let i = 0; i < 6; i++) digits.push(dw.getUint8(i).toString(16).padStart(2, '0'));

        return digits.join(':');
    }

    /**
     * Convert a mac addres to a buffer
     *
     * @param {string} mac Mac to convert
     * @returns {ArrayBuffer} Converted buffer
     */
    public static toBuffer(mac: string): ArrayBuffer {
        Mac.isValid(mac, false, true);

        const arr = new ArrayBuffer(6);
        const dw = new DataView(arr);

        mac.split(':').forEach((v: string, k: number) => {
            dw.setUint8(k, parseInt(v, 16));
        });

        return arr;
    }

    /**
     * Check if a mac address is valid
     *
     * @param {string} mac Mac address to check
     * @param {boolean} noBroadcast If true, broadcast addresses are considered invalid
     * @param {boolean} throwException If true, an exception is thrown if the address is invalid
     * @returns {boolean} True if the interface is valid, false otherwise
     */
    public static isValid(mac: string, noBroadcast = false, throwException = false) {
        let valid = macRegexp.test(mac);

        if (valid && noBroadcast) {
            valid = (parseInt(mac.split(':')[0], 16) & 1) === 0;
        }

        if (throwException && !valid) {
            throw new InvalidMACException(mac);
        }

        return valid;
    }

    /**
     * Add n to the mac address
     *
     * @param {string} mac Mac to increment
     * @param {number} toAdd Value to add
     * @returns {string} New mac address
     */
    public static increment(mac: string, toAdd = 1): string {
        if (Mac.isValid(mac, false, true)) {
            const mac_num = Mac.toInt(mac);
            if (mac_num + BigInt(toAdd) > 0xffffffffffffn || mac_num + BigInt(toAdd) < 0) {
                throw new InvalidMACException(mac + ' + ' + toAdd);
            }
            return Mac.fromInt(mac_num + BigInt(toAdd));
        }
    }
}
