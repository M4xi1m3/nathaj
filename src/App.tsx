import { Box, Paper } from '@mui/material';
import React, { useState } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { HorizontalDivider, VerticalDivider } from './components/Dividers';
import { AddMenu } from './components/menus/AddMenu';
import { FileMenu } from './components/menus/FileMenu';
import { RemoveMenu } from './components/menus/RemoveMenu';
import { ViewMenu } from './components/menus/ViewMenu';
import { NetworkAnalyzer } from './components/panels/NetworkAnalyzer';
import { NetowrkProperties } from './components/panels/NetworkProperties';
import { NetworkRenderer } from './components/panels/NetworkRenderer';
import { NoPanels } from './components/panels/NoPanels';
import { TopBar } from './components/TopBar';

const App: React.FC = () => {
    const [viewNetwork, setViewNetwork] = useState<boolean>(true);
    const [viewProperties, setViewProperties] = useState<boolean>(true);
    const [viewAnalyzer, setViewAnalyzer] = useState<boolean>(true);

    const [selected, setSelected] = useState<string | null>(null);

    const noPanel = !(viewNetwork || viewProperties || viewAnalyzer);

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', wudth: '100%' }}>
                <Box sx={{ flexGrow: 1 }}>
                    <TopBar>
                        <FileMenu selected={selected} setSelected={setSelected} />
                        <AddMenu />
                        <RemoveMenu selected={selected} setSelected={setSelected} />
                        <ViewMenu
                            elements={[
                                { name: 'Network', view: viewNetwork, setView: setViewNetwork },
                                { name: 'Properties', view: viewProperties, setView: setViewProperties },
                                { name: 'Packet analyzer', view: viewAnalyzer, setView: setViewAnalyzer },
                            ]}
                        />
                    </TopBar>
                </Box>
                {!noPanel ? (
                    <PanelGroup direction='vertical'>
                        {viewProperties || viewNetwork ? (
                            <Panel defaultSize={50} style={{ display: 'flex' }} order={1}>
                                <PanelGroup direction='horizontal'>
                                    {viewProperties ? (
                                        <Panel style={{ display: 'flex' }} order={1}>
                                            <Paper sx={{ flexGrow: 1, margin: 1, width: '100%', overflowX: 'auto' }}>
                                                <NetowrkProperties selected={selected} />
                                            </Paper>
                                        </Panel>
                                    ) : (
                                        <></>
                                    )}
                                    {viewProperties && viewNetwork ? <VerticalDivider /> : <></>}
                                    {viewNetwork ? (
                                        <Panel defaultSize={75} style={{ display: 'flex' }} order={2}>
                                            <Paper sx={{ flexGrow: 1, margin: 1 }}>
                                                <NetworkRenderer setSelected={setSelected} selected={selected} />
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
                            <Panel style={{ display: 'flex' }} order={2}>
                                <Paper sx={{ flexGrow: 1, maxWidth: '100%', overflowX: 'auto', margin: 1 }}>
                                    <NetworkAnalyzer />
                                </Paper>
                            </Panel>
                        ) : (
                            <></>
                        )}
                    </PanelGroup>
                ) : (
                    <NoPanels />
                )}
            </Box>
        </>
    );
};

export default App;
