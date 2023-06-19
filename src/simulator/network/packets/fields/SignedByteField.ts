import { DataViewField } from "./DataViewField";

/**
 * Signed byte field
 */
export class SignedByteField extends DataViewField {
    protected read = DataView.prototype.getInt8;
    protected write = DataView.prototype.setInt8;
    protected length = 1;
}
