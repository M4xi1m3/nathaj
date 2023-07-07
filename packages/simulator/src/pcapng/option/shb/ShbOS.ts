import { StringOption } from '../StringOption';

/**
 * UTF-8 string containing the name of the operating system used to create
 * the section.
 */
export class ShbOS extends StringOption {
    get code() {
        return 3;
    }
    get name() {
        return 'shb_os';
    }
}
