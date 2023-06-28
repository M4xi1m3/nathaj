import { StringOption } from '../StringOption';

/**
 * UTF-8 string containing the description of tie interface.
 */
export class IfDescription extends StringOption {
    get code() {
        return 2;
    }
    get name() {
        return 'if_description';
    }
}
