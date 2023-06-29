import { describe, it } from 'vitest';
import { StringOption } from './StringOption';

export class OptDummy extends StringOption {
    get code() {
        return 1;
    }
    get name() {
        return 'opt_dummy';
    }
}

describe('String option', () => {
    it('raw', () => {
        const comment = new OptDummy('Lorem ipsum!');
        const buff = new Uint8Array(comment.raw());
        expect(buff).toStrictEqual(
            new Uint8Array([0, 1, 0, 12, 76, 111, 114, 101, 109, 32, 105, 112, 115, 117, 109, 33])
        );

        const comment2 = new OptDummy('Lorem ipsu');
        const buff2 = new Uint8Array(comment2.raw());
        expect(buff2).toStrictEqual(
            new Uint8Array([0, 1, 0, 10, 76, 111, 114, 101, 109, 32, 105, 112, 115, 117, 0, 0])
        );
    });

    it('name', () => {
        const comment = new OptDummy('Lorem ipsum!');
        expect(comment.name).toStrictEqual('opt_dummy');
    });
});
