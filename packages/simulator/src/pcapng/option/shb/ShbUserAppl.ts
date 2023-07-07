import { StringOption } from '../StringOption';

/**
 * UTF-8 string containing the name of application used to create
 * the section.
 */
export class ShbUserAppl extends StringOption {
    get code() {
        return 4;
    }
    get name() {
        return 'shb_userappl';
    }
}
