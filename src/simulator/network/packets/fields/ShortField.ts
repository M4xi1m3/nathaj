import { DataViewField } from "./DataViewField";

/**
 * Unsigned 2 bytes integer field
 */
export class ShortField extends DataViewField {
    protected read = DataView.prototype.getUint16;
    protected write = DataView.prototype.setUint16;
    protected length = 2;
}
