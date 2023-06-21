import { Box, Paper } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useContext, useState } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { AddHostDialog } from './components/dialogs/AddHostDialog';
import { AddHubDialog } from './components/dialogs/AddHubDialog';
import { AddLinkDialog } from './components/dialogs/AddLinkDialog';
import { AddStpSwitchDialog } from './components/dialogs/AddStpSwitchDialog';
import { AddSwitchDialog } from './components/dialogs/AddSwitchDialog';
import { RemoveDeviceDialog } from './components/dialogs/RemoveDeviceDialog';
import { RemoveLinkDialog } from './components/dialogs/RemoveLinkDialog';
import { HorizontalDivider, VerticalDivider } from './components/Dividers';
import { ActionMenu } from './components/menus/ActionMenu';
import { ViewMenu } from './components/menus/ViewMenu';
import { NetworkAnalyzer } from './components/panels/NetworkAnalyzer';
import { NetworkRenderer } from './components/panels/NetworkRenderer';
import { NetowrkProperties } from './components/panels/NetworProperties';
import { NoPanels } from './components/panels/NoPanels';
import { TopBar } from './components/TopBar';
import { saveJson } from './hooks/saveJson';
import { selectFile } from './hooks/selectFile';
import { NetworkContext } from './NetworkContext';

const App: React.FC = () => {
    const [viewNetwork, setViewNetwork] = useState<boolean>(true);
    const [viewProperties, setViewProperties] = useState<boolean>(true);
    const [viewAnalyzer, setViewAnalyzer] = useState<boolean>(true);

    const noPanel = !(viewNetwork || viewProperties || viewAnalyzer);

    const net = useContext(NetworkContext);

    const [addHostOpened, setAddHostOpened] = useState<boolean>(false);
    const [addHubOpened, setAddHubOpened] = useState<boolean>(false);
    const [addSwitchOpened, setAddSwitchOpened] = useState<boolean>(false);
    const [addStpSwitchOpened, setAddStpSwitchOpened] = useState<boolean>(false);
    const [addLinkDialogOpened, setAddLinkDialogOpened] = useState<boolean>(false);

    const [removeDeviceOpened, setRemoveDeviceOpened] = useState<boolean>(false);
    const [removeLinkOpened, setRemoveLinkOpened] = useState<boolean>(false);

    const { enqueueSnackbar } = useSnackbar();

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', wudth: '100%' }}>
                <Box sx={{ flexGrow: 1 }}>
                    <TopBar>
                        <ActionMenu
                            title='File'
                            elements={[
                                {
                                    name: 'Save',
                                    action: () => {
                                        saveJson(net.save(), 'network.json');
                                    },
                                },
                                {
                                    name: 'Load',
                                    action: () => {
                                        selectFile('application/json', false).then((file: File | File[]) => {
                                            if (file instanceof File) {
                                                file.arrayBuffer().then((buffer) => {
                                                    const dec = new TextDecoder('utf-8');
                                                    try {
                                                        net.load(JSON.parse(dec.decode(buffer)));
                                                    } catch (e: any) {
                                                        enqueueSnackbar((e as Error).message, {
                                                            variant: 'error',
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    },
                                },
                            ]}
                        />

                        <AddHostDialog opened={addHostOpened} close={() => setAddHostOpened(false)} />
                        <AddHubDialog opened={addHubOpened} close={() => setAddHubOpened(false)} />
                        <AddSwitchDialog opened={addSwitchOpened} close={() => setAddSwitchOpened(false)} />
                        <AddStpSwitchDialog opened={addStpSwitchOpened} close={() => setAddStpSwitchOpened(false)} />
                        <AddLinkDialog opened={addLinkDialogOpened} close={() => setAddLinkDialogOpened(false)} />

                        <ActionMenu
                            title='Add'
                            elements={[
                                {
                                    name: 'Host',
                                    action: () => {
                                        setAddHostOpened(true);
                                    },
                                },
                                {
                                    name: 'Hub',
                                    action: () => {
                                        setAddHubOpened(true);
                                    },
                                },
                                {
                                    name: 'Switch',
                                    action: () => {
                                        setAddSwitchOpened(true);
                                    },
                                },
                                {
                                    name: 'STP Switch',
                                    action: () => {
                                        setAddStpSwitchOpened(true);
                                    },
                                },
                                'separator',
                                {
                                    name: 'Link',
                                    action: () => {
                                        setAddLinkDialogOpened(true);
                                    },
                                },
                            ]}
                        />

                        <RemoveDeviceDialog opened={removeDeviceOpened} close={() => setRemoveDeviceOpened(false)} />
                        <RemoveLinkDialog opened={removeLinkOpened} close={() => setRemoveLinkOpened(false)} />

                        <ActionMenu
                            title='Remove'
                            elements={[
                                {
                                    name: 'Device',
                                    action: () => {
                                        setRemoveDeviceOpened(true);
                                    },
                                },
                                {
                                    name: 'Link',
                                    action: () => {
                                        setRemoveLinkOpened(true);
                                    },
                                },
                            ]}
                        />
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
                ) : (
                    <NoPanels />
                )}
            </Box>
        </>
    );
};

export default App;
