import { DataViewField } from "./DataViewField";

/**
 * Signed 4 bytes integer field
 */
export class SignedIntField extends DataViewField {
    protected read = DataView.prototype.getInt32;
    protected write = DataView.prototype.setInt32;
    protected length = 4;
}
