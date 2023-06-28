import { describe, expect, it, vi } from 'vitest';
import { Network } from '../Network';
import { Host } from './Host';
import { Hub } from './Hub';

describe('Hub', () => {
    /**
     * Test the hub peripheral
     */
    it('hub', () => {
        const net = new Network();
        const h1 = new Host(net, 'h1', '00:00:00:00:00:01');
        const h2 = new Host(net, 'h2', '00:00:00:00:00:02');
        const h3 = new Host(net, 'h3', '00:00:00:00:00:03');
        new Hub(net, 'hub1', 3, '00:00:00:00:01:01');

        net.addLink('hub1', 'h1');
        net.addLink('hub1', 'h2');
        net.addLink('hub1', 'h3');

        h1.getInterface('eth0').send(new ArrayBuffer(0));

        const h1PacketReveivedSpy = vi.spyOn(h1, 'onPacketReceived');
        const h2PacketReveivedSpy = vi.spyOn(h2, 'onPacketReceived');
        const h3PacketReveivedSpy = vi.spyOn(h3, 'onPacketReceived');

        for (let i = 0; i < 10; i++) net.tick();

        expect(h1PacketReveivedSpy).toHaveBeenCalledTimes(0);
        expect(h2PacketReveivedSpy).toHaveBeenCalled();
        expect(h3PacketReveivedSpy).toHaveBeenCalled();
    });
    it('save', () => {
        const net = new Network();
        const h1 = new Hub(net, 'h1', 2, '00:00:00:00:00:01');

        expect(h1.save()).toStrictEqual({
            type: 'hub',
            name: 'h1',
            interfaces: [
                {
                    name: 'eth0',
                    mac: '00:00:00:00:00:01',
                },
                {
                    name: 'eth1',
                    mac: '00:00:00:00:00:02',
                },
            ],
            x: 0,
            y: 0,
        });
    });
});
