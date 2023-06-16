import { Network } from './simulator/network/Network';
import { Host } from './simulator/network/peripherals/Host';
import { NetworkContext } from './NetworkContexxt';
import { NetworkRenderer } from './components/NetworkRenderer';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { AppBar, Box, Paper, Toolbar, Typography } from '@mui/material';
import { NetworkActions } from './components/NetworkActions';
import { NetworkAnalyzer } from './components/NetworkAnalyzer';
import { STPSwitch } from './simulator/network/peripherals/STPSwitch';
import { Vector2D } from './simulator/drawing/Vector2D';

const net = new Network();

for (let i = 0; i < 10; i++) {
    const sw = new STPSwitch(net, "s" + (i + 1), "00:0b:00:00:00:" + (i + 1), 4);
    const h = new Host(net, "h" + (i + 1), "00:0a:00:00:00:" + (i + 1));
    net.addLink("h" + (i + 1), "eth0", "s" + (i + 1), "eth3");
    if (i < 5) {
        sw.position = new Vector2D(0, i * 100)
        h.position = new Vector2D(-100, i * 100)
    } else {
        sw.position = new Vector2D(100, (9 - i) * 100)
        h.position = new Vector2D(200, (9 - i) * 100)
    }
}
for (let i = 0; i < 10; i++) {
    net.addLink("s" + (i + 1), "eth0", "s" + ((i + 1) % 10 + 1), "eth1");
}
for (let i = 1; i < 5; i++) {
    net.addLink("s" + (i + 1), "eth2", "s" + (10 - i), "eth2");
}

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
