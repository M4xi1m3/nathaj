import { PcapngOption } from '../PcapngOption';

export enum FlagDirection {
    Unknown = 0b00,
    Inbound = 0b01,
    Outbound = 0b10,
}

export enum FlagReceptionType {
    Unknown = 0b000,
    Unicast = 0b001,
    Multicast = 0b010,
    Broadcast = 0b011,
    Promiscuous = 0b100,
}

/**
 * Flags of an enhanced packet block
 */
export class EpbFlags extends PcapngOption {
    public readonly direction: FlagDirection;
    public readonly reception_type: FlagReceptionType;
    public readonly fcs_length: number;

    constructor(direction = FlagDirection.Unknown, reception_type = FlagReceptionType.Unknown, fcs_length = 0) {
        super();
        this.direction = direction;
        this.reception_type = reception_type;
        this.fcs_length = fcs_length;
    }

    get code() {
        return 2;
    }

    get name() {
        return 'epb_flags';
    }
    get value(): ArrayBuffer {
        const data = new ArrayBuffer(4);
        const dw = new DataView(data);

        let flags = 0;
        flags |= this.direction & 0b11;
        flags |= (this.reception_type & 0b111) << 2;
        flags |= (this.fcs_length & 0b1111) << 5;
        dw.setUint32(0, flags);

        return data;
    }
}
