import { StringOption } from '../StringOption';

/**
 * UTF-8 string containing the description of the hardware used to create
 * the section.
 */
export class ShbHardware extends StringOption {
    get code() {
        return 2;
    }
    get name() {
        return 'shb_hardware';
    }
}
