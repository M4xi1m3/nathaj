import { Network } from '../network/Network';
import { AnalyzedPacket } from '../network/packets/Packet';
import { Device } from '../network/peripherals/Device';
import { Interface } from '../network/peripherals/Interface';
import { Buffers } from '../utils/Buffers';
import { EnhancedPacketBlock } from './blocks/EnhancedPacketBlock';
import { HeaderBlock } from './blocks/HeaderBlock';
import { EpbFlags, FlagDirection } from './option/epb/EpbFlags';
import { IfFscLen } from './option/if/IfFscLen';
import { IfMacAddr } from './option/if/IfMacAddr';
import { IfName } from './option/if/IfName';
import { IfTsResol } from './option/if/IfTsResol';
import { OptComment } from './option/opt/OptComment';
import { ShbUserAppl } from './option/shb/ShbUserAppl';

export class PcapngWriter {
    public static write(net: Network, packets: AnalyzedPacket[]) {
        const date = Date.now();
        const header = new HeaderBlock();
        header.options.push(new ShbUserAppl('Näthaj'));
        header.options.push(new OptComment('User-Agent: ' + navigator.userAgent));

        net.getDevices().forEach((dev: Device) => {
            dev.getInterfaces().forEach((intf: Interface) => {
                const intf_block = header.addInterface(intf.getFullName());
                intf_block.options.push(new IfName(intf.getFullName()));
                intf_block.options.push(new IfMacAddr(intf.getMac()));
                intf_block.options.push(new IfTsResol(3));
                intf_block.options.push(new IfFscLen(4));
            });
        });

        let data = header.raw();
        Object.values(header.interfaces).forEach((intf) => {
            data = Buffers.concatenate(data, intf.raw());
        });

        packets.forEach((packet) => {
            const packet_block = new EnhancedPacketBlock(
                packet.data,
                BigInt(Math.round(packet.time * 1000)) + BigInt(date),
                header.interfaces[packet.origin].id
            );

            packet_block.options.push(
                new EpbFlags(packet.direction === 'outgoing' ? FlagDirection.Outbound : FlagDirection.Inbound)
            );

            data = Buffers.concatenate(data, packet_block.raw());
        });

        return data;
    }
}
