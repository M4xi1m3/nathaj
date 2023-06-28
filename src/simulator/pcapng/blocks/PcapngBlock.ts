import { Buffers } from '../../utils/Buffers';

export abstract class PcapngBlock {
    abstract get type(): number;
    abstract get body(): ArrayBuffer;

    /**
     * Convert the block to raw binary data
     *
     * @returns {ArrayBuffer} Block's raw data
     */
    public raw(): ArrayBuffer {
        const startbuf = new ArrayBuffer(8);
        const startdw = new DataView(startbuf);

        let body = this.body;
        body = Buffers.concatenate(body, new ArrayBuffer((4 - (body.byteLength % 4)) % 4));

        startdw.setUint32(0, this.type);
        startdw.setUint32(4, body.byteLength + 12);

        const endbuf = new ArrayBuffer(4);
        const enddw = new DataView(endbuf);
        enddw.setUint32(0, body.byteLength + 12);

        return Buffers.concatenate(startbuf, Buffers.concatenate(body, endbuf));
    }
}
