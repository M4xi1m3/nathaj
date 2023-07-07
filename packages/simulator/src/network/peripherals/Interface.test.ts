import { describe, expect, it, vi } from 'vitest';
import { CustomEvent } from '../../utils/CustomEvent';
import { Network, PacketEventData } from '../Network';
import { Device, SavedDevice } from './Device';
import {
    AlreadyConnectedException,
    ConnectionToItselfException,
    Interface,
    NotConnectedException,
    NotInSameNetworkException,
} from './Interface';

describe('Interface', () => {
    /**
     * Stub device class used to test the interfaces
     */
    class StubDevice extends Device {
        public onPacketReceived(iface: Interface, data: ArrayBuffer): void {
            iface;
            data;
        }
        public tick(): void {
            //
        }
        public reset(): void {
            //
        }
        public save(): SavedDevice {
            return {
                type: 'stub',
                name: this.getName(),
                interfaces: this.getInterfaces().map((intf) => intf.save()),
                x: 0,
                y: 0,
            };
        }
        public getType() {
            return 'stub';
        }
    }

    /**
     * Test the getters
     */
    it('getters', () => {
        const net = new Network();
        const dev = new StubDevice(net, 'd1');
        const intf = dev.addInterface('eth0', '00:00:00:00:01:01');

        expect(intf.getOwner()).toBe(dev);
        expect(intf.getName()).toEqual('eth0');
        expect(intf.getFullName()).toEqual('d1-eth0');
        expect(typeof intf.toString()).toEqual('string');
    });

    /**
     * Test the connect, disconnect, isConnected and getConnection methods
     */
    it('connection', () => {
        const net = new Network();
        const dev = new StubDevice(net, 'd1');
        const eth0 = dev.addInterface('eth0', '00:00:00:00:01:01');
        const eth1 = dev.addInterface('eth1', '00:00:00:00:01:02');

        expect(eth0.isConnected()).toEqual(false);
        expect(eth1.isConnected()).toEqual(false);
        expect(eth0.getConnection()).toEqual(null);
        expect(eth1.getConnection()).toEqual(null);

        eth0.connect(eth1);

        expect(eth0.isConnected()).toEqual(true);
        expect(eth1.isConnected()).toEqual(true);
        expect(eth0.getConnection()).toEqual(eth1);
        expect(eth1.getConnection()).toEqual(eth0);

        eth0.disconnect();

        expect(eth0.isConnected()).toEqual(false);
        expect(eth1.isConnected()).toEqual(false);
        expect(eth0.getConnection()).toEqual(null);
        expect(eth1.getConnection()).toEqual(null);
    });

    /**
     * Test connecting an interface to itself
     */
    it('connection to itself', () => {
        const net = new Network();
        const dev = new StubDevice(net, 'd1');
        const eth0 = dev.addInterface('eth0', '00:00:00:00:01:01');

        expect(() => eth0.connect(eth0)).toThrowError(ConnectionToItselfException);
    });

    /**
     * Test connecting an interface to an already connected interface
     */
    it('connection to already connected', () => {
        const net = new Network();
        const dev = new StubDevice(net, 'd1');
        const eth0 = dev.addInterface('eth0', '00:00:00:00:01:01');
        const eth1 = dev.addInterface('eth1', '00:00:00:00:01:02');
        const eth2 = dev.addInterface('eth2', '00:00:00:00:01:03');

        eth0.connect(eth1);

        expect(() => eth0.connect(eth2)).toThrowError(AlreadyConnectedException);
        expect(() => eth2.connect(eth0)).toThrowError(AlreadyConnectedException);
    });

    /**
     * Test connecting an interface to an interface in another network
     */
    it('connection to other network', () => {
        const net0 = new Network();
        const dev0 = new StubDevice(net0, 'd1');
        const eth0 = dev0.addInterface('eth0', '00:00:00:00:01:01');

        const net1 = new Network();
        const dev1 = new StubDevice(net1, 'd1');
        const eth1 = dev1.addInterface('eth0', '00:00:00:00:02:01');

        expect(() => eth1.connect(eth0)).toThrowError(NotInSameNetworkException);
        expect(() => eth0.connect(eth1)).toThrowError(NotInSameNetworkException);
    });

    /**
     * Test disconnecting a non-connected interface
     */
    it('disconnect not connected', () => {
        const net0 = new Network();
        const dev0 = new StubDevice(net0, 'd1');
        const eth0 = dev0.addInterface('eth0', '00:00:00:00:01:01');

        expect(() => eth0.disconnect()).toThrowError(NotConnectedException);
    });

    /**
     * Test the send method
     */
    it('send', () => {
        const net0 = new Network();
        const dev0 = new StubDevice(net0, 'd1');
        const eth0 = dev0.addInterface('eth0', '00:00:00:00:01:01');
        const eth1 = dev0.addInterface('eth1', '00:00:00:00:01:02');

        eth0.send(new ArrayBuffer(0));

        eth0.connect(eth1);

        expect(eth1['receive_queue'].length).toEqual(0);
        eth0.send(new ArrayBuffer(0));
        expect(eth1['receive_queue'].length).toEqual(1);
    });

    /**
     * Test the tick method
     */
    it('tick', () => {
        const net0 = new Network();
        const dev0 = new StubDevice(net0, 'd1');
        const eth0 = dev0.addInterface('eth0', '00:00:00:00:01:01');
        const eth1 = dev0.addInterface('eth1', '00:00:00:00:01:02');

        const packetEventSpy = vi.spyOn(net0, 'dispatchEvent');
        const receivedataEventSpy = vi.spyOn(eth0, 'dispatchEvent');

        eth0.connect(eth1);
        eth0.tick();
        eth1.send(new ArrayBuffer(0));
        eth0.tick();

        expect(packetEventSpy).toHaveBeenCalledWith(expect.any(CustomEvent<PacketEventData>));
        expect(receivedataEventSpy).toHaveBeenCalledWith(expect.any(CustomEvent<PacketEventData>));
    });

    it('save', () => {
        const net0 = new Network();
        const dev0 = new StubDevice(net0, 'd1');
        const eth0 = dev0.addInterface('eth0', '00:00:00:00:01:01');
        const eth1 = dev0.addInterface('eth1', '00:00:00:00:01:02');

        expect(eth0.save()).toStrictEqual({
            mac: '00:00:00:00:01:01',
            name: 'eth0',
        });

        eth0.connect(eth1);

        expect(eth0.save()).toStrictEqual({
            name: 'eth0',
            mac: '00:00:00:00:01:01',
            connected_to: {
                device: 'd1',
                interface: 'eth1',
            },
        });
    });
});
