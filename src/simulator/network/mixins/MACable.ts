import { Device } from '../peripherals/Device';

const macRegexp = new RegExp('^(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$');

export class InvalidMACException extends Error {
    constructor(mac: string) {
        super('Invalid mac address ' + mac + '.');
    }
}

/**
 * Class representing a device with a mac address
 */
export abstract class MACable extends Device {
    /**
     * MAC address of the host
     */
    private mac = '';

    /**
     * Get the MAC address of the host
     *
     * @returns {string} MAC address of the host
     */
    public getMac(): string {
        return this.mac;
    }

    /**
     * Set the MAC address of the host
     *
     * @param {string} mac New mac address
     */
    public setMac(mac: string) {
        if (this.mac !== mac) {
            if (macRegexp.test(mac) && (parseInt(mac.split(':')[0], 16) & 1) === 0) {
                this.mac = mac;
                this.dispatchEvent(new Event('changed'));
            } else {
                throw new InvalidMACException(mac);
            }
        }
    }
}
