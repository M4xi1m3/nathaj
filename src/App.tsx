import { Network } from './simulator/network/Network';
import { NetworkContext } from './NetworkContext';
import { NetworkRenderer } from './components/NetworkRenderer';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { AppBar, Box, Paper, Toolbar, Typography } from '@mui/material';
import { NetworkActions } from './components/NetworkActions';
import { NetworkAnalyzer } from './components/NetworkAnalyzer';
import { Layout } from './simulator/drawing/Layout';
import { STPSwitch } from './simulator/network/peripherals/STPSwitch';
import { HorizontalDivider, VerticalDivider } from './components/Dividers';

const net = new Network();

new STPSwitch(net, "s1", "00:0b:00:00:00:01", 5);
new STPSwitch(net, "s2", "00:0b:00:00:00:02", 5);

net.addLink("s1", "s2");

Layout.spring_layout(net);

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
                    <Panel defaultSize={50} style={{ display: "flex" }}>
                        <PanelGroup direction="horizontal">
                            <Panel defaultSize={50} style={{ display: "flex" }}>
                                <Paper sx={{ flexGrow: 1, margin: 1 }}>
                                    <NetworkRenderer />
                                </Paper>
                            </Panel>
                            <VerticalDivider />
                            <Panel style={{ display: "flex" }}>
                                <Paper sx={{ flexGrow: 1, maxWidth: "100%", overflowX: 'auto', margin: 1 }}>
                                </Paper>
                            </Panel>
                        </PanelGroup>
                    </Panel>
                    <HorizontalDivider />
                    <Panel style={{ display: "flex" }}>
                        <Paper sx={{ flexGrow: 1, maxWidth: "100%", overflowX: 'auto', margin: 1 }}>
                            <NetworkAnalyzer />
                        </Paper>
                    </Panel>
                </PanelGroup>
            </Box>
        </NetworkContext.Provider>
    );
}

export default App;
