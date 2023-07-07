import { DataViewField } from './DataViewField';

/**
 * Single precision floating number field
 */
export class FloatField extends DataViewField {
    protected read = DataView.prototype.getFloat32;
    protected write = DataView.prototype.setFloat32;
    protected length = 4;
}
