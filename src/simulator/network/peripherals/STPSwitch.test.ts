import { describe, expect, it } from 'vitest';
import { Network } from '../Network';
import { PortRole, PortState, STPSwitch } from './STPSwitch';

describe('STP Switch', () => {
    it('forwarding', () => {
        const net = new Network();
        const sw1 = new STPSwitch(net, 'sw1', 3, '00:00:00:00:00:01');
        const sw2 = new STPSwitch(net, 'sw2', 3, '00:00:00:00:00:02');

        net.addLink('sw1', 'eth0', 'sw2', 'eth0');

        net['paused_at'] = 3;
        for (let i = 0; i < 10; i++) net.tick();

        expect(sw1.getInterface('eth0').state).toEqual(PortState.Listening);
        expect(sw1.getInterface('eth0').role).toEqual(PortRole.Designated);

        expect(sw2.getInterface('eth0').state).toEqual(PortState.Listening);
        expect(sw2.getInterface('eth0').role).toEqual(PortRole.Root);

        net['paused_at'] = 20;

        for (let i = 0; i < 10; i++) net.tick();

        expect(sw1.getInterface('eth0').state).toEqual(PortState.Learning);
        expect(sw1.getInterface('eth0').role).toEqual(PortRole.Designated);

        expect(sw2.getInterface('eth0').state).toEqual(PortState.Learning);
        expect(sw2.getInterface('eth0').role).toEqual(PortRole.Root);

        net['paused_at'] = 40;

        for (let i = 0; i < 10; i++) net.tick();

        expect(sw1.getInterface('eth0').state).toEqual(PortState.Forwarding);
        expect(sw1.getInterface('eth0').role).toEqual(PortRole.Designated);

        expect(sw2.getInterface('eth0').state).toEqual(PortState.Forwarding);
        expect(sw2.getInterface('eth0').role).toEqual(PortRole.Root);
    });

    it('root loop', () => {
        const net = new Network();
        const sw1 = new STPSwitch(net, 'sw1', 3, '00:00:00:00:00:01');

        net.addLink('sw1', 'eth0', 'sw1', 'eth1');

        net['paused_at'] = 3;
        for (let i = 0; i < 10; i++) net.tick();

        expect(sw1.getInterface('eth0').state).toEqual(PortState.Listening);
        expect(sw1.getInterface('eth0').role).toEqual(PortRole.Designated);
        expect(sw1.getInterface('eth1').state).toEqual(PortState.Blocking);
        expect(sw1.getInterface('eth1').role).toEqual(PortRole.Blocking);
    });

    it('triangle', () => {
        const net = new Network();
        const sw1 = new STPSwitch(net, 'sw1', 3, '00:00:00:00:01:01');
        const sw2 = new STPSwitch(net, 'sw2', 3, '00:00:00:00:02:01');
        const sw3 = new STPSwitch(net, 'sw3', 3, '00:00:00:00:03:01');

        net.addLink('sw1', 'eth0', 'sw2', 'eth1');
        net.addLink('sw2', 'eth0', 'sw3', 'eth1');
        net.addLink('sw3', 'eth0', 'sw1', 'eth1');

        net['paused_at'] = 3;
        for (let i = 0; i < 10; i++) net.tick();

        expect(sw1.getInterface('eth0').state).toEqual(PortState.Listening);
        expect(sw1.getInterface('eth0').role).toEqual(PortRole.Designated);
        expect(sw1.getInterface('eth1').state).toEqual(PortState.Listening);
        expect(sw1.getInterface('eth1').role).toEqual(PortRole.Designated);

        expect(sw2.getInterface('eth0').state).toEqual(PortState.Listening);
        expect(sw2.getInterface('eth0').role).toEqual(PortRole.Designated);
        expect(sw2.getInterface('eth1').state).toEqual(PortState.Listening);
        expect(sw2.getInterface('eth1').role).toEqual(PortRole.Root);

        expect(sw3.getInterface('eth0').state).toEqual(PortState.Listening);
        expect(sw3.getInterface('eth0').role).toEqual(PortRole.Root);
        expect(sw3.getInterface('eth1').state).toEqual(PortState.Blocking);
        expect(sw3.getInterface('eth1').role).toEqual(PortRole.Blocking);
    });

    it('save', () => {
        const net = new Network();
        const h1 = new STPSwitch(net, 'sw1', 4, '00:00:00:00:00:01');

        expect(h1.save()).toStrictEqual({
            type: 'stp-switch',
            priority: 32768,
            name: 'sw1',
            interfaces: [
                {
                    mac: '00:00:00:00:00:01',
                    name: 'eth0',
                    cost: 1,
                    disabled: false,
                },
                {
                    mac: '00:00:00:00:00:02',
                    name: 'eth1',
                    cost: 1,
                    disabled: false,
                },
                {
                    mac: '00:00:00:00:00:03',
                    name: 'eth2',
                    cost: 1,
                    disabled: false,
                },
                {
                    mac: '00:00:00:00:00:04',
                    name: 'eth3',
                    cost: 1,
                    disabled: false,
                },
            ],
            x: 0,
            y: 0,
        });
    });
});
