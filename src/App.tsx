import { Network } from './simulator/network/Network';
import { NetworkContext } from './NetworkContext';
import { NetworkRenderer } from './components/NetworkRenderer';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { AppBar, Box, Paper, Toolbar, Typography } from '@mui/material';
import { NetworkActions } from './components/NetworkActions';
import { NetworkAnalyzer } from './components/NetworkAnalyzer';
import { Vector2D } from './simulator/drawing/Vector2D';
import { Switch } from './simulator/network/peripherals/Switch';
import { Host } from './simulator/network/peripherals/Host';
import { Ethernet } from './simulator/network/packets/definitions/Ethernet';
import { Layout } from './simulator/drawing/Layout';
import { STPSwitch } from './simulator/network/peripherals/STPSwitch';

class CustomHost extends Host {
    sent: boolean;
    sendto: string;

    constructor(network: Network, name: string, mac: string, sendto: string) {
        super(network, name, mac);
        this.sendto = sendto;
        this.sent = false;
    }

    tick(): void {
        if (!this.sent) {
            const packet = new Ethernet({
                src: this.getMac(),
                dst: this.sendto,
                type: 0
            });
            this.getInterface("eth0").send(packet.raw());
        }
        this.sent = true;
    }

    reset(): void {
        this.sent = false;
    }
}



const net = new Network();

// const h1 = new CustomHost(net, "h1", "00:0a:00:00:00:01", "00:0a:00:00:00:02");
// h1.setPosition(new Vector2D(-100, 0));
const s1 = new STPSwitch(net, "s1", "00:0b:00:00:00:01", 4);
s1.setPosition(new Vector2D(0, 0));
const s2 = new STPSwitch(net, "s2", "00:0b:00:00:00:02", 4);
s2.setPosition(new Vector2D(100, 0));
const s3 = new STPSwitch(net, "s3", "00:0b:00:00:00:03", 4);
s3.setPosition(new Vector2D(100, 100));
const s4 = new STPSwitch(net, "s4", "00:0b:00:00:00:04", 4);
s4.setPosition(new Vector2D(0, 100));

net.addLink("s1", "s2")
net.addLink("s2", "s3")
net.addLink("s3", "s4")
net.addLink("s4", "s1")
// net.addLink("s1", "h1")
net.addLink("s1", "s3")

console.log(net)

Layout.re_center(net);

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
                            <PanelResizeHandle style={{ width: "10px" }} />
                            <Panel style={{ display: "flex" }}>
                                <Paper sx={{ flexGrow: 1, maxWidth: "100%", overflowX: 'auto', margin: 1 }}>
                                </Paper>
                            </Panel>
                        </PanelGroup>
                    </Panel>
                    <PanelResizeHandle style={{ height: "10px" }} />
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
