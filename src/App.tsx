import { Network } from './simulator/network/Network';
import { NetworkContext } from './NetworkContext';
import { NetworkRenderer } from './components/NetworkRenderer';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { Box, Paper } from '@mui/material';
import { NetworkAnalyzer } from './components/NetworkAnalyzer';
import { Layout } from './simulator/drawing/Layout';
import { STPSwitch } from './simulator/network/peripherals/STPSwitch';
import { HorizontalDivider, VerticalDivider } from './components/Dividers';
import React, { useState } from 'react';
import { TopBar, ViewMenu } from './components/TopBar';
import { NetowrkProperties } from './components/NetworProperties';

const net = new Network();

new STPSwitch(net, 's1', '00:0b:00:00:00:01', 5);
new STPSwitch(net, 's2', '00:0b:00:00:00:02', 5);

net.addLink('s1', 's2');

Layout.spring_layout(net);

const App: React.FC = () => {
    const [viewNetwork, setViewNetwork] = useState<boolean>(true);
    const [viewProperties, setViewProperties] = useState<boolean>(true);
    const [viewAnalyzer, setViewAnalyzer] = useState<boolean>(true);

    return (
        <NetworkContext.Provider value={net}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', wudth: '100%' }}>
                <Box sx={{ flexGrow: 1 }}>
                    <TopBar>
                        <ViewMenu
                            elements={[
                                { name: 'Network', view: viewNetwork, setView: setViewNetwork },
                                { name: 'Properties', view: viewProperties, setView: setViewProperties },
                                { name: 'Packet analyzer', view: viewAnalyzer, setView: setViewAnalyzer },
                            ]}
                        />
                    </TopBar>
                </Box>
                <PanelGroup direction='vertical'>
                    {viewProperties || viewNetwork ? (
                        <Panel defaultSize={50} style={{ display: 'flex' }}>
                            <PanelGroup direction='horizontal'>
                                {viewProperties ? (
                                    <Panel style={{ display: 'flex' }}>
                                        <Paper sx={{ flexGrow: 1, margin: 1 }}>
                                            <NetowrkProperties />
                                        </Paper>
                                    </Panel>
                                ) : (
                                    <></>
                                )}
                                {viewProperties && viewNetwork ? <VerticalDivider /> : <></>}
                                {viewNetwork ? (
                                    <Panel defaultSize={75} style={{ display: 'flex' }}>
                                        <Paper sx={{ flexGrow: 1, margin: 1 }}>
                                            <NetworkRenderer />
                                        </Paper>
                                    </Panel>
                                ) : (
                                    <></>
                                )}
                            </PanelGroup>
                        </Panel>
                    ) : (
                        <></>
                    )}
                    {(viewProperties || viewNetwork) && viewAnalyzer ? <HorizontalDivider /> : <></>}
                    {viewAnalyzer ? (
                        <Panel style={{ display: 'flex' }}>
                            <Paper sx={{ flexGrow: 1, maxWidth: '100%', overflowX: 'auto', margin: 1 }}>
                                <NetworkAnalyzer />
                            </Paper>
                        </Panel>
                    ) : (
                        <></>
                    )}
                </PanelGroup>
            </Box>
        </NetworkContext.Provider>
    );
};

export default App;
