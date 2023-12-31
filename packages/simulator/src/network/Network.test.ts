import { describe, expect, it, vi } from 'vitest';
import {
    DeviceNameTaken,
    DeviceNotFound,
    Network,
    NetworkAlreadyRunningException,
    NetworkNotRunningException,
} from './Network';
import { Device, DeviceRemoved, SavedDevice } from './peripherals/Device';
import { Host } from './peripherals/Host';
import { Interface } from './peripherals/Interface';

describe('Network', () => {
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
     * Test adding devices
     */
    it('add device', () => {
        const net = new Network();
        new StubDevice(net, 'dev0');

        expect(net.getDevices().length).toEqual(1);
        expect(() => new StubDevice(net, 'dev0')).toThrowError(DeviceNameTaken);
        expect(net.getDevices().length).toEqual(1);
    });

    /**
     * Test removing devices
     */
    it('remove device', () => {
        const net = new Network();
        const h1 = new Host(net, 'h1', '00:0a:00:00:00:01');
        new Host(net, 'h2', '00:0a:00:00:00:02');

        net.addLink('h1', 'h2');

        expect(net.getDevices().length).toEqual(2);
        net.removeDevice('h1');
        expect(net.getDevices().length).toEqual(1);
        expect(net.getDevice('h2').getInterface('eth0').isConnected()).toEqual(false);
        expect(() => net.removeDevice('h1')).toThrowError(DeviceNotFound);

        expect(() => h1.getNetwork()).toThrowError(DeviceRemoved);
    });

    /**
     * Test getting devices
     */
    it('get device', () => {
        const net = new Network();
        const dev0 = new StubDevice(net, 'dev0');

        expect(net.hasDevice('dev0')).toEqual(true);
        expect(net.getDevice('dev0')).toBe(dev0);
        expect(net.hasDevice('dev1')).toEqual(false);
        expect(() => net.getDevice('dev1')).toThrow(DeviceNotFound);
    });

    /**
     * Test the isMACUsed method
     */
    it('mac used', () => {
        const net = new Network();
        new Host(net, 'h0', '00:00:00:00:00:01');

        expect(net.isMACUsed('00:00:00:00:00:02')).toEqual(false);
        expect(net.isMACUsed('00:00:00:00:00:01')).toEqual(true);
    });

    /**
     * Test the addLink method
     */
    it('add link', () => {
        const net = new Network();
        const h1 = new Host(net, 'h1', '00:00:00:00:01:01');
        h1.addInterface('eth1', '00:00:00:00:01:02');
        h1.addInterface('eth2', '00:00:00:00:01:03');
        const h2 = new Host(net, 'h2', '00:00:00:00:01:01');

        net.addLink('h1', 'h2');
        expect(h1.getInterface('eth0').getConnection()).toBe(h2.getInterface('eth0'));

        net.addLink('h1', 'h1');
        expect(h1.getInterface('eth1').getConnection()).toBe(h1.getInterface('eth2'));

        h1.getInterface('eth0').disconnect();
        h1.getInterface('eth1').disconnect();

        net.addLink('h1', 'eth2', 'h2', 'eth0');
        expect(h1.getInterface('eth2').getConnection()).toBe(h2.getInterface('eth0'));
    });

    /**
     * Test the removeLink method
     */
    it('remove link', () => {
        const net = new Network();
        const h1 = new Host(net, 'h1', '00:00:00:00:01:01');
        h1.addInterface('eth1', '00:00:00:00:01:02');
        const h2 = new Host(net, 'h2', '00:00:00:00:02:01');
        h2.addInterface('eth1', '00:00:00:00:02:02');
        h2.addInterface('eth2', '00:00:00:00:02:03');
        const h3 = new Host(net, 'h3', '00:00:00:00:03:01');

        net.addLink('h1', 'eth0', 'h2', 'eth1');
        net.addLink('h1', 'eth1', 'h2', 'eth0');
        net.addLink('h2', 'eth2', 'h3', 'eth0');

        expect(h1.getInterface('eth0').isConnected()).toEqual(true);
        expect(h1.getInterface('eth1').isConnected()).toEqual(true);
        expect(h2.getInterface('eth0').isConnected()).toEqual(true);
        expect(h2.getInterface('eth1').isConnected()).toEqual(true);
        expect(h2.getInterface('eth2').isConnected()).toEqual(true);
        expect(h3.getInterface('eth0').isConnected()).toEqual(true);

        net.removeLink('h1', 'h2');

        expect(h1.getInterface('eth0').isConnected()).toEqual(false);
        expect(h1.getInterface('eth1').isConnected()).toEqual(false);
        expect(h2.getInterface('eth0').isConnected()).toEqual(false);
        expect(h2.getInterface('eth1').isConnected()).toEqual(false);
        expect(h2.getInterface('eth2').isConnected()).toEqual(true);
        expect(h3.getInterface('eth0').isConnected()).toEqual(true);

        net.addLink('h1', 'eth0', 'h2', 'eth1');
        expect(h1.getInterface('eth0').isConnected()).toEqual(true);
        expect(h2.getInterface('eth1').isConnected()).toEqual(true);
        net.removeLink('h1', 'eth0', 'h2', 'eth1');
        expect(h1.getInterface('eth0').isConnected()).toEqual(false);
        expect(h2.getInterface('eth1').isConnected()).toEqual(false);
    });

    /**
     * Test the tick method
     */
    it('tick', () => {
        const net = new Network();
        const h1 = new Host(net, 'h1', '00:00:00:00:00:01');

        const hostTickSpy = vi.spyOn(h1, 'tick');
        const intfTickSpy = vi.spyOn(h1.getInterface('eth0'), 'tick');

        net.tick();

        expect(hostTickSpy).toHaveBeenCalled();
        expect(intfTickSpy).toHaveBeenCalled();
    });

    /**
     * Test the start, stop, reset and time method
     */
    it('start stop reset time', () => {
        const net = new Network();
        net.start();
        expect(net.isRunning()).toEqual(true);
        expect(() => net.start()).toThrowError(NetworkAlreadyRunningException);
        net.stop();
        expect(net.isRunning()).toEqual(false);
        expect(() => net.stop()).toThrowError(NetworkNotRunningException);
        expect(net.time()).toBeGreaterThan(0);
        net.reset();
        expect(net.time()).toBe(0);
        net.start();
        net.reset();
        expect(net.isRunning()).toEqual(false);
        expect(net.time()).toBe(0);
    });

    /**
     * Test the clear method
     */
    it('clear', () => {
        const net = new Network();
        new Host(net, 'h1', '00:00:00:00:00:01');

        net.start();
        expect(net.getDevices().length).toEqual(1);
        expect(net.isRunning()).toEqual(true);
        net.clear();
        expect(net.getDevices().length).toEqual(0);
        expect(net.isRunning()).toEqual(false);
    });

    it('save', () => {
        const net = new Network();
        new Host(net, 'h1', '00:00:00:00:00:01');

        expect(net.save().devices.length).toEqual(1);
    });
});
