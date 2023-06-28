import { Buffers } from '../../network/utils/Buffers';

export abstract class PcapngBlock {
    abstract get type(): number;
    abstract get body(): ArrayBuffer;

    /**
     * Convert the block to raw binary data
     *
     * @returns {ArrayBuffer} Block's raw data
     */
    public raw(): ArrayBuffer {
        let startbuf = new ArrayBuffer(8);
        let startdw = new DataView(startbuf);

        let body = this.body;
        body = Buffers.concatenate(body, new ArrayBuffer((4 - (body.byteLength % 4)) % 4));

        startdw.setUint32(0, this.type);
        startdw.setUint32(4, body.byteLength + 12);

        let endbuf = new ArrayBuffer(4);
        let enddw = new DataView(endbuf);
        enddw.setUint32(0, body.byteLength + 12);

        return Buffers.concatenate(startbuf, Buffers.concatenate(body, endbuf));
    }
}
