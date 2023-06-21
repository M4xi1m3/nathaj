import { Network } from '../Network';
import { Ethernet } from '../packets/definitions/Ethernet';
import { Host } from './Host';
import { Switch } from './Switch';

/**
 * Test the switch peripheral
 */
it('switch', () => {
    const net = new Network();
    const h1 = new Host(net, 'h1', '00:00:00:00:00:01');
    const h2 = new Host(net, 'h2', '00:00:00:00:00:02');
    const h3 = new Host(net, 'h3', '00:00:00:00:00:03');
    const sw1 = new Switch(net, 'sw1', '00:00:00:00:00:04', 3);

    net.addLink('sw1', 'h1');
    net.addLink('sw1', 'h2');
    net.addLink('sw1', 'h3');

    // Send a first packet to make the switch learn h1's mac address
    h1.getInterface('eth0').send(
        new Ethernet({
            src: '00:00:00:00:00:01',
            dst: '00:00:00:00:00:02',
            type: 0,
        }).raw()
    );

    const h1PacketReveivedSpy = jest.spyOn(h1, 'onPacketReceived');
    const h2PacketReveivedSpy = jest.spyOn(h2, 'onPacketReceived');
    const h3PacketReveivedSpy = jest.spyOn(h3, 'onPacketReceived');

    for (let i = 0; i < 10; i++) net.tick();

    // It is expected to have been broadcasted
    expect(h1PacketReveivedSpy).toHaveBeenCalledTimes(0);
    expect(h2PacketReveivedSpy).toHaveBeenCalled();
    expect(h3PacketReveivedSpy).toHaveBeenCalled();

    h1PacketReveivedSpy.mockClear();
    h2PacketReveivedSpy.mockClear();
    h3PacketReveivedSpy.mockClear();

    // Send a packet from h2 to h1 to check if the switch has learned h1's mac address
    h2.getInterface('eth0').send(
        new Ethernet({
            src: '00:00:00:00:00:02',
            dst: '00:00:00:00:00:01',
            type: 0,
        }).raw()
    );

    for (let i = 0; i < 10; i++) net.tick();

    // It is expected to only have been sent to h1
    expect(h1PacketReveivedSpy).toHaveBeenCalled();
    expect(h2PacketReveivedSpy).toHaveBeenCalledTimes(0);
    expect(h3PacketReveivedSpy).toHaveBeenCalledTimes(0);

    // Check the mac addres table content
    expect(sw1['mac_address_table']).toEqual({
        '00:00:00:00:00:01': 'eth0',
        '00:00:00:00:00:02': 'eth1',
    });

    // Reset the switch and ensure the mac address table has been cleared
    sw1.reset();
    expect(Object.values(sw1['mac_address_table']).length).toEqual(0);
});

/**
 * Test the getMac method
 */
it('mac', () => {
    const net = new Network();
    const sw1 = new Switch(net, 'sw1', '00:00:00:00:00:01', 4);

    expect(sw1.getMac()).toEqual('00:00:00:00:00:01');
});
