import { StringOption } from '../StringOption';

/**
 * UTF-8 option containing human readable comment text
 * associated to the current block
 */
export class OptComment extends StringOption {
    get code() {
        return 1;
    }
    get name() {
        return 'opt_comment';
    }
}
