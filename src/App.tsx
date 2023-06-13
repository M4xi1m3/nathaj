import { useState } from 'react';
import { Canvas } from './components/Canvas';
import { Network } from './simulator/network/Network';
import { Device } from './simulator/network/peripherals/Device';
import { Host } from './simulator/network/peripherals/Host';
import { Switch } from './simulator/network/peripherals/Switch';
import { NetworkContext } from './NetworkContexxt';
import { NetworkRenderer } from './components/NetworkRenderer';

const net = new Network();
const s1 = new Switch(net, "s1", "00:0b:00:00:00:01", 5)
const h1 = new Host(net, "h1", "00:0a:00:00:00:01");
const h2 = new Host(net, "h2", "00:0a:00:00:00:02");
const h3 = new Host(net, "h3", "00:0a:00:00:00:03");
const h4 = new Host(net, "h4", "00:0a:00:00:00:04");
net.addLink("h1", "eth0", "s1", "eth0");
net.addLink("h2", "eth0", "s1", "eth1");
net.addLink("h3", "eth0", "s1", "eth2");
net.addLink("h4", "eth0", "s1", "eth3");
const s2 = new Switch(net, "s2", "00:0b:00:00:00:02", 5)
const h5 = new Host(net, "h5", "00:0a:00:00:00:05");
const h6 = new Host(net, "h6", "00:0a:00:00:00:06");
const h7 = new Host(net, "h7", "00:0a:00:00:00:07");
const h8 = new Host(net, "h8", "00:0a:00:00:00:08");
net.addLink("h5", "eth0", "s2", "eth0");
net.addLink("h6", "eth0", "s2", "eth1");
net.addLink("h7", "eth0", "s2", "eth2");
net.addLink("h8", "eth0", "s2", "eth3");

net.addLink("s1", "eth4", "s2", "eth4");

function App() {
    return (
        <NetworkContext.Provider value={net}>
            <NetworkRenderer />
        </NetworkContext.Provider>
    );
}

export default App;
