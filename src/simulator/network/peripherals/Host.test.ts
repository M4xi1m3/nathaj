import { Network } from '../Network';
import { Host } from './Host';

it('mac', () => {
    const net = new Network();
    const h1 = new Host(net, 'h1', '00:00:00:00:00:01');

    expect(h1.getMac()).toEqual('00:00:00:00:00:01');
});
