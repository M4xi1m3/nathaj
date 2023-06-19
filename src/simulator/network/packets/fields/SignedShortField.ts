import { DataViewField } from "./DataViewField";

/**
 * Signed 2 bytes integer field
 */
export class SignedShortField extends DataViewField {
    protected read = DataView.prototype.getInt16;
    protected write = DataView.prototype.setInt16;
    protected length = 2;
}
