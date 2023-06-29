import { StringOption } from '../StringOption';

/**
 * UTF-8 string containing the name of the interface.
 */
export class IfName extends StringOption {
    get code() {
        return 2;
    }
    get name() {
        return 'if_name';
    }
}
