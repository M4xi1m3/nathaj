import { describe, expect, it } from 'vitest';
import { Network } from '../Network';
import { Host } from './Host';

describe('Host', () => {
    it('save', () => {
        const net = new Network();
        const h1 = new Host(net, 'h1', '00:00:00:00:00:01');

        expect(h1.save()).toStrictEqual({
            type: 'host',
            name: 'h1',
            interfaces: [
                {
                    mac: '00:00:00:00:00:01',
                    name: 'eth0',
                },
            ],
            x: 0,
            y: 0,
        });

        new Host(net, 'h2', '00:00:00:00:00:02');
        net.addLink('h1', 'h2');

        expect(h1.save()).toStrictEqual({
            type: 'host',
            name: 'h1',
            interfaces: [
                {
                    name: 'eth0',
                    mac: '00:00:00:00:00:01',
                    connected_to: {
                        device: 'h2',
                        interface: 'eth0',
                    },
                },
            ],
            x: 0,
            y: 0,
        });
    });
});
