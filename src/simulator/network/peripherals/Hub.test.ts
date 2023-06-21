import { Network } from '../Network';
import { Host } from './Host';
import { Hub } from './Hub';

/**
 * Test the hub peripheral
 */
it('hub', () => {
    const net = new Network();
    const h1 = new Host(net, 'h1', '00:00:00:00:00:01');
    const h2 = new Host(net, 'h2', '00:00:00:00:00:02');
    const h3 = new Host(net, 'h3', '00:00:00:00:00:03');
    new Hub(net, 'hub1', 3);

    net.addLink('hub1', 'h1');
    net.addLink('hub1', 'h2');
    net.addLink('hub1', 'h3');

    h1.getInterface('eth0').send(new ArrayBuffer(0));

    const h1PacketReveivedSpy = jest.spyOn(h1, 'onPacketReceived');
    const h2PacketReveivedSpy = jest.spyOn(h2, 'onPacketReceived');
    const h3PacketReveivedSpy = jest.spyOn(h3, 'onPacketReceived');

    for (let i = 0; i < 10; i++) net.tick();

    expect(h1PacketReveivedSpy).toHaveBeenCalledTimes(0);
    expect(h2PacketReveivedSpy).toHaveBeenCalled();
    expect(h3PacketReveivedSpy).toHaveBeenCalled();
});
