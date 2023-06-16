import { Network } from './simulator/network/Network';
import { Host } from './simulator/network/peripherals/Host';
import { Hub } from './simulator/network/peripherals/Hub';
import { NetworkContext } from './NetworkContexxt';
import { NetworkRenderer } from './components/NetworkRenderer';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { AppBar, Box, Paper, Toolbar, Typography } from '@mui/material';
import { NetworkActions } from './components/NetworkActions';
import { Ethernet } from './simulator/network/packets/definitions/Ethernet';
import { NetworkAnalyzer } from './components/NetworkAnalyzer';

class CustomHost extends Host {
    timer: number = 0;

    tick(): void {
        if (this.getNetwork().time() > this.timer) {
            this.timer = this.getNetwork().time() + 2;
            const packet = new Ethernet({
                src: this.getMac(),
                dst: "ff:ff:ff:ff:ff:ff",
                type: 0
            });
            this.getInterface("eth0").send(packet.raw());
        }
    }

    reset(): void {
        this.timer = 0;
    }
}

const net = new Network();

const s1 = new Hub(net, "s1", "00:0b:00:00:00:01", 4)
const h1 = new CustomHost(net, "h1", "00:0a:00:00:00:01");
const h2 = new Host(net, "h2", "00:0a:00:00:00:02");
const h3 = new Host(net, "h3", "00:0a:00:00:00:03");
const h4 = new Host(net, "h4", "00:0a:00:00:00:04");
net.addLink("h1", "eth0", "s1", "eth0");
net.addLink("h2", "eth0", "s1", "eth1");
net.addLink("h3", "eth0", "s1", "eth2");
net.addLink("h4", "eth0", "s1", "eth3");

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
                            <NetworkActions />
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
                                <Paper sx={{ flexGrow: 1, maxWidth: "100%", overflowX: 'auto', margin: 1 }}>
                                    <NetworkAnalyzer />
                                </Paper>
                            </Panel>
                        </PanelGroup>
                    </Panel>
                    <PanelResizeHandle style={{ height: "10px" }} />
                    <Panel style={{ display: "flex" }}>
                        <Paper sx={{ flexGrow: 1, maxWidth: "100%", overflowX: 'auto', margin: 1 }}>
                        </Paper>
                    </Panel>
                </PanelGroup>
            </Box>
        </NetworkContext.Provider>
    );
}

export default App;
