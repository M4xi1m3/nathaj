import { Mac } from '../../../utils/Mac';
import { PcapngOption } from '../PcapngOption';

/**
 * Mac address of the interface.
 */
export class IfMacAddr extends PcapngOption {
    public readonly mac: string;

    constructor(mac: string) {
        super();

        Mac.isValid(mac, false, true);

        this.mac = mac;
    }

    get code() {
        return 6;
    }
    get name() {
        return 'if_MACaddr';
    }
    get value(): ArrayBuffer {
        return Mac.toBuffer(this.mac);
    }
}
