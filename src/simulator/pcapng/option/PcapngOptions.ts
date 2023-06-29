import { Buffers } from '../../utils/Buffers';
import { PcapngOption } from './PcapngOption';

export class PcapngOptions<T extends PcapngOption> extends Array<T> {
    raw(): ArrayBuffer {
        let out = new ArrayBuffer(0);

        if (this.length === 0) {
            return out;
        }

        for (const option of this) {
            if (option.name === 'opt_endofopt') break;

            out = Buffers.concatenate(out, option.raw());
        }

        return Buffers.concatenate(out, new ArrayBuffer(4));
    }
}
