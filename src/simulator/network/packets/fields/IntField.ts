import { DataViewField } from './DataViewField';

/**
 * Unsigned 4 bytes integer field
 */
export class IntField extends DataViewField {
    protected read = DataView.prototype.getUint32;
    protected write = DataView.prototype.setUint32;
    protected length = 4;
}
