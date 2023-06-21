import { Network } from '../Network';
import { PortRole, PortState, STPSwitch } from './STPSwitch';

it('forwarding', () => {
    const net = new Network();
    const sw1 = new STPSwitch(net, 'sw1', '00:00:00:00:00:01', 3);
    const sw2 = new STPSwitch(net, 'sw2', '00:00:00:00:00:02', 3);

    net.addLink('sw1', 'eth0', 'sw2', 'eth0');

    net['paused_at'] = 3;
    for (let i = 0; i < 10; i++) net.tick();

    expect(sw1['port_infos']['eth0'].state).toEqual(PortState.Listening);
    expect(sw1['port_infos']['eth0'].role).toEqual(PortRole.Designated);

    expect(sw2['port_infos']['eth0'].state).toEqual(PortState.Listening);
    expect(sw2['port_infos']['eth0'].role).toEqual(PortRole.Root);

    net['paused_at'] = 20;

    for (let i = 0; i < 10; i++) net.tick();

    expect(sw1['port_infos']['eth0'].state).toEqual(PortState.Learning);
    expect(sw1['port_infos']['eth0'].role).toEqual(PortRole.Designated);

    expect(sw2['port_infos']['eth0'].state).toEqual(PortState.Learning);
    expect(sw2['port_infos']['eth0'].role).toEqual(PortRole.Root);

    net['paused_at'] = 40;

    for (let i = 0; i < 10; i++) net.tick();

    expect(sw1['port_infos']['eth0'].state).toEqual(PortState.Forwarding);
    expect(sw1['port_infos']['eth0'].role).toEqual(PortRole.Designated);

    expect(sw2['port_infos']['eth0'].state).toEqual(PortState.Forwarding);
    expect(sw2['port_infos']['eth0'].role).toEqual(PortRole.Root);
});

it('root loop', () => {
    const net = new Network();
    const sw1 = new STPSwitch(net, 'sw1', '00:00:00:00:00:01', 3);

    net.addLink('sw1', 'eth0', 'sw1', 'eth1');

    net['paused_at'] = 3;
    for (let i = 0; i < 10; i++) net.tick();

    expect(sw1['port_infos']['eth0'].state).toEqual(PortState.Listening);
    expect(sw1['port_infos']['eth0'].role).toEqual(PortRole.Designated);
    expect(sw1['port_infos']['eth1'].state).toEqual(PortState.Blocking);
    expect(sw1['port_infos']['eth1'].role).toEqual(PortRole.Blocking);
});

it('triangle', () => {
    const net = new Network();
    const sw1 = new STPSwitch(net, 'sw1', '00:00:00:00:00:01', 3);
    const sw2 = new STPSwitch(net, 'sw2', '00:00:00:00:00:02', 3);
    const sw3 = new STPSwitch(net, 'sw3', '00:00:00:00:00:03', 3);

    net.addLink('sw1', 'eth0', 'sw2', 'eth1');
    net.addLink('sw2', 'eth0', 'sw3', 'eth1');
    net.addLink('sw3', 'eth0', 'sw1', 'eth1');

    net['paused_at'] = 3;
    for (let i = 0; i < 10; i++) net.tick();

    expect(sw1['port_infos']['eth0'].state).toEqual(PortState.Listening);
    expect(sw1['port_infos']['eth0'].role).toEqual(PortRole.Designated);
    expect(sw1['port_infos']['eth1'].state).toEqual(PortState.Listening);
    expect(sw1['port_infos']['eth1'].role).toEqual(PortRole.Designated);

    expect(sw2['port_infos']['eth0'].state).toEqual(PortState.Listening);
    expect(sw2['port_infos']['eth0'].role).toEqual(PortRole.Designated);
    expect(sw2['port_infos']['eth1'].state).toEqual(PortState.Listening);
    expect(sw2['port_infos']['eth1'].role).toEqual(PortRole.Root);

    expect(sw3['port_infos']['eth0'].state).toEqual(PortState.Listening);
    expect(sw3['port_infos']['eth0'].role).toEqual(PortRole.Root);
    expect(sw3['port_infos']['eth1'].state).toEqual(PortState.Blocking);
    expect(sw3['port_infos']['eth1'].role).toEqual(PortRole.Blocking);
});

/**
 * Test the getMac method
 */
it('mac', () => {
    const net = new Network();
    const sw1 = new STPSwitch(net, 'sw1', '00:00:00:00:00:01', 4);

    expect(sw1.getMac()).toEqual('00:00:00:00:00:01');
});

it('save', () => {
    const net = new Network();
    const h1 = new STPSwitch(net, 'sw1', '00:00:00:00:00:01', 4);

    expect(h1.save()).toStrictEqual({
        type: 'stp-switch',
        mac: '00:00:00:00:00:01',
        name: 'sw1',
        interfaces: [
            {
                name: 'eth0',
            },
            {
                name: 'eth1',
            },
            {
                name: 'eth2',
            },
            {
                name: 'eth3',
            },
        ],
        x: 0,
        y: 0,
    });
});
