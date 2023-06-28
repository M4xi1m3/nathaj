import { PcapngOption } from './PcapngOption';

export abstract class StringOption extends PcapngOption {
    private val: string;

    get value() {
        const te = new TextEncoder();
        return te.encode(this.val);
    }

    constructor(val: string) {
        super();
        this.val = val;
    }
}
