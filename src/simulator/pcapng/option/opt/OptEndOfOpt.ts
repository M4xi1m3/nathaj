import { PcapngOption } from '../PcapngOption';

/**
 * Delimits the end of the optional fields
 */
export class OptEndOfOpt extends PcapngOption {
    get code() {
        return 0;
    }
    get name() {
        return 'opt_endofopt';
    }
    get value() {
        return new ArrayBuffer(0);
    }
}
