import { ShortField } from "./ShortField";

/**
 * Unsigned 2 bytes hexadecimal integer field
 */
export class XShortField extends ShortField {
    protected hex = true;
}
