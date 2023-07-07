import { Field } from '../Field';
import { _Packet } from '../Packet';

/**
 * Field that will be used only if the condition is true
 */
export class ConditionalField extends Field {
    private condition: (packet: _Packet<any>) => boolean;
    private field: Field;

    constructor(field: Field, condition: (packet: _Packet<any>) => boolean) {
        super(field.name);
        this.field = field;
        this.condition = condition;
    }

    parse(data: ArrayBuffer, position: number, packet: _Packet<any>): ArrayBuffer {
        if (this.condition(packet)) {
            return this.field.parse(data, position, packet);
        }

        return data;
    }

    raw(data: ArrayBuffer, packet: _Packet<any>): ArrayBuffer {
        if (this.condition(packet)) {
            return this.field.raw(data, packet);
        }

        return data;
    }

    repr(value: any): string {
        return this.field.repr(value);
    }
}
