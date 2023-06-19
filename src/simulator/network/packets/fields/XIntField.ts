import { IntField } from './IntField';

/**
 * Unsigned 4 bytes integer hexadecimal field
 */
export class XIntField extends IntField {
    protected hex = true;
}
