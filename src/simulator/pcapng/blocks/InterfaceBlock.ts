import { Buffers } from '../../utils/Buffers';
import { IfDescription } from '../option/if/IfDescription';
import { IfFscLen } from '../option/if/IfFscLen';
import { IfIPv4Address } from '../option/if/IfIPv4Address';
import { IfMacAddr } from '../option/if/IfMacAddr';
import { IfName } from '../option/if/IfName';
import { IfTsOffset } from '../option/if/IfTsOffset';
import { IfTsResol } from '../option/if/IfTsResol';
import { OptComment } from '../option/opt/OptComment';
import { PcapngOptions } from '../option/PcapngOptions';
import { PcapngBlock } from './PcapngBlock';

/**
 * Type of link. @see https://www.tcpdump.org/linktypes.html
 */
export enum LinkType {
    LINKTYPE_ETHERNET = 1,
}

export type InterfaceOptions =
    | IfName
    | IfDescription
    | IfMacAddr
    | IfIPv4Address
    | IfTsOffset
    | IfTsResol
    | IfFscLen
    | OptComment;

export class InterfaceBlock extends PcapngBlock {
    public readonly options = new PcapngOptions<InterfaceOptions>();
    public readonly id: number;

    constructor(id = 0) {
        super();
        this.id = id;
    }

    public link_type: LinkType = LinkType.LINKTYPE_ETHERNET;
    public snaplen = 0;

    get type() {
        return 0x00000001;
    }

    get body() {
        const body = new ArrayBuffer(8);
        const dw = new DataView(body);

        dw.setUint16(0, this.link_type);
        dw.setUint16(2, 0); // Reserved
        dw.setUint32(4, this.snaplen);

        return Buffers.concatenate(body, this.options.raw());
    }
}
