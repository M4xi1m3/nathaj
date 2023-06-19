import { DataViewField } from "./DataViewField";

/**
 * Double precision floating point number field
 */
export class DoubleField extends DataViewField {
    protected read = DataView.prototype.getFloat64;
    protected write = DataView.prototype.setFloat64;
    protected length = 8;
}
