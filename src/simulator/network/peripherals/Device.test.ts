import { describe, expect, it } from 'vitest';
import { Network } from '../Network';
import { Device, InterfaceNameTaken, NoFreeInterfaces, SavedDevice } from './Device';
import { Interface, InvalidMACException } from './Interface';

describe('Device', () => {
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
     * Test adding interfaces to the device
     */
    it('add interface', () => {
        const net = new Network();
        const dev = new StubDevice(net, 'd1');
        expect(dev.addInterface('eth0', '00:00:00:00:00:01')).toBeInstanceOf(Interface);
        expect(() => dev.addInterface('eth0', '00:00:00:00:00:01')).toThrowError(InterfaceNameTaken);
        expect(() => dev.addInterface('eth1', "W're no strangers to love")).toThrowError(InvalidMACException);
    });

    /**
     * Test the getters
     */
    it('getters', () => {
        const net = new Network();
        const dev = new StubDevice(net, 'd1');
        dev.addInterface('eth0', '00:00:00:00:00:01');
        dev.addInterface('eth1', '00:00:00:00:00:02');

        expect(dev.getInterfaces().length).toEqual(2);
        expect(dev.getName()).toEqual('d1');
        expect(dev.getNetwork()).toBe(net);
        expect(dev.time()).toEqual(net.time());
        expect(typeof dev.toString()).toEqual('string');
    });

    /**
     * Test getting interfaces
     */
    it('get interface', () => {
        const net = new Network();
        const dev = new StubDevice(net, 'd1');
        const eth0 = dev.addInterface('eth0', '00:00:00:00:00:01');
        dev.addInterface('eth1', '00:00:00:00:00:02');

        expect(dev.hasInterface('eth0')).toEqual(true);
        expect(dev.getInterface('eth0')).toBe(eth0);
        expect(dev.hasInterface('eth2')).toEqual(false);
        expect(dev.getInterface('eth2')).toBe(undefined);
    });

    /**
     * Test getting a free interface
     */
    it('get free interfaces', () => {
        const net = new Network();
        const dev = new StubDevice(net, 'd1');
        const eth0 = dev.addInterface('eth0', '00:00:00:00:00:01');
        const eth1 = dev.addInterface('eth1', '00:00:00:00:00:02');

        expect(dev.hasFreeInterface()).toEqual(true);
        expect(dev.getFreeInterface()).toBe(eth0);
        expect(dev.getFreeInterface(['eth0'])).toBe(eth1);

        eth0.connect(eth1);

        expect(dev.hasFreeInterface()).toEqual(false);
        expect(() => dev.getFreeInterface()).toThrowError(NoFreeInterfaces);
    });

    /**
     * Test checking if the device has a connected interface
     */
    it('get free interfaces', () => {
        const net = new Network();
        const dev = new StubDevice(net, 'd1');
        const eth0 = dev.addInterface('eth0', '00:00:00:00:00:01');
        const eth1 = dev.addInterface('eth1', '00:00:00:00:00:02');

        expect(dev.hasConnectedInterface()).toEqual(false);
        eth0.connect(eth1);
        expect(dev.hasConnectedInterface()).toEqual(true);
    });
});
