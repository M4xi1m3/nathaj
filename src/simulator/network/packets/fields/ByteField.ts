import { DataViewField } from './DataViewField';

/**
 * Unsigned byte field
 */
export class ByteField extends DataViewField {
    protected read = DataView.prototype.getUint8;
    protected write = DataView.prototype.setUint8;
    protected length = 1;
}
