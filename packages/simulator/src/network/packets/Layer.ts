import { Packet, _Packet } from './Packet';

/**
 * Class used to link packets using attributes
 */
export class Layer {
    private static bind_table: {
        [name: string]: { match: (packet: _Packet<object>) => boolean; next: typeof _Packet<object> }[];
    } = {};

    /**
     * Apply the layer finding
     *
     * @param {_Packet} packet Packet to find the next layer of
     * @returns
     */
    static apply<T extends _Packet<object>>(packet: T): typeof Packet<object> | undefined {
        if (!(packet.getProto() in Layer.bind_table)) {
            return undefined;
        }
        return Layer.bind_table[packet.getProto()].find(
            (val: { match: (packet: _Packet<object>) => boolean; next: typeof _Packet<object> }) => {
                return val.match(packet);
            }
        )?.next;
    }

    /**
     * Bind two protocols together
     *
     * @param {typeof _Packet<object>} under Lover-layer protocol
     * @param {typeof _Packet<object>} over Upper-layer protocol
     * @param {(packet: T) => boolean} match Match function
     */
    static bind<T extends _Packet<object>>(
        under: typeof _Packet<object>,
        over: typeof _Packet<object>,
        match: (packet: T) => boolean
    ): void {
        if (!(under.proto in Layer.bind_table)) {
            Layer.bind_table[under.proto] = [];
        }

        Layer.bind_table[under.proto].push({
            match: match as (packet: _Packet<object>) => boolean,
            next: over,
        });
    }
}
