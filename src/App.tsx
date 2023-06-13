import { Network } from './simulator/network/Network';
import { Host } from './simulator/network/peripherals/Host';
import { Switch } from './simulator/network/peripherals/Switch';
import { NetworkContext } from './NetworkContexxt';
import { NetworkRenderer } from './components/NetworkRenderer';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { AppBar, Box, Paper, Toolbar, Typography } from '@mui/material';

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
            <Box sx={{ display: 'flex', flexDirection: 'column', height: "100%", wudth: "100%" }}>
                <Box sx={{ flexGrow: 1 }}>
                    <AppBar position='static'>
                        <Toolbar variant='dense'>
                            <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                                Web-NetSim
                            </Typography>
                        </Toolbar>
                    </AppBar>
                </Box>
                <PanelGroup direction="vertical">
                    <Panel defaultSize={75} style={{ display: "flex" }}>
                        <PanelGroup direction="horizontal">
                            <Panel defaultSize={75} style={{ display: "flex" }}>
                                <Paper sx={{ flexGrow: 1, margin: 1 }}>
                                    <NetworkRenderer />
                                </Paper>
                            </Panel>
                            <PanelResizeHandle style={{ width: "10px" }} />
                            <Panel style={{ display: "flex" }}>
                                <Paper sx={{ flexGrow: 1, margin: 1 }}>
                                    <Typography>Network logs</Typography>
                                </Paper>
                            </Panel>
                        </PanelGroup>
                    </Panel>
                    <PanelResizeHandle style={{ height: "10px" }} />
                    <Panel style={{ display: "flex" }}>
                        <Paper sx={{ flexGrow: 1, margin: 1, marginTop: 1 }}>
                            <Typography>Console</Typography>
                        </Paper>
                    </Panel>
                </PanelGroup>
            </Box>
        </NetworkContext.Provider>
    );
}

export default App;
