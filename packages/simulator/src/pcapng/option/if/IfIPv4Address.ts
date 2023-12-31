import { IPv4 } from '../../../utils/IPv4';
import { PcapngOption } from '../PcapngOption';

/**
 * IPV4 address of the interface.
 */
export class IfIPv4Address extends PcapngOption {
    public readonly ip: string;

    constructor(ip: string) {
        super();

        IPv4.isValid(ip, true);

        this.ip = ip;
    }

    get code() {
        return 4;
    }
    get name() {
        return 'if_IPv4addr';
    }
    get value(): ArrayBuffer {
        return IPv4.toBuffer(this.ip);
    }
}
