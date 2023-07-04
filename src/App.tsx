import { Box, Paper } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import useMousetrap from 'react-hook-mousetrap';
import { useTranslation } from 'react-i18next';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { HorizontalDivider, VerticalDivider } from './components/Dividers';
import { AddMenu } from './components/menus/AddMenu';
import { FileMenu } from './components/menus/FileMenu';
import { HelpMenu } from './components/menus/HelpMenu';
import { RemoveMenu } from './components/menus/RemoveMenu';
import { ViewMenu } from './components/menus/ViewMenu';
import { NetworkAnalyzer } from './components/panels/NetworkAnalyzer';
import { NetowrkProperties } from './components/panels/NetworkProperties';
import { NetworkRenderer } from './components/panels/NetworkRenderer';
import { NoPanels } from './components/panels/NoPanels';
import { TopBar } from './components/TopBar';
import { NetworkContext } from './NetworkContext';

const App: React.FC = () => {
    const { t } = useTranslation();

    // View attributes for the different panels
    const [viewNetwork, setViewNetwork] = useState<boolean>(true);
    const [viewProperties, setViewProperties] = useState<boolean>(true);
    const [viewAnalyzer, setViewAnalyzer] = useState<boolean>(true);

    const [selected, setSelected] = useState<string | null>(null);
    const [playing, setPlaying] = useState(false);

    const noPanel = !(viewNetwork || viewProperties || viewAnalyzer);

    const net = useContext(NetworkContext);

    // Save the workspace to local storage when pags unloads
    const handleUnload = () => {
        localStorage.setItem('workspace', JSON.stringify(net.save()));
    };

    // Load from local storage when page loads
    const handleLoad = () => {
        const workspace = localStorage.getItem('workspace');
        if (workspace !== null) {
            try {
                net.load(JSON.parse(workspace));
            } catch (e: any) {
                //
            }
        }
    };

    // Bin load and unload events
    useEffect(() => {
        window.addEventListener('beforeunload', handleUnload);
        window.addEventListener('load', handleLoad);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
            window.removeEventListener('load', handleLoad);
        };
    }, [handleUnload]);

    useMousetrap('ctrl+alt+shift+n', (e: KeyboardEvent) => {
        e.preventDefault();
        setViewNetwork(!viewNetwork);
    });

    useMousetrap('ctrl+alt+shift+p', (e: KeyboardEvent) => {
        e.preventDefault();
        setViewProperties(!viewProperties);
    });

    useMousetrap('ctrl+alt+shift+a', (e: KeyboardEvent) => {
        e.preventDefault();
        setViewAnalyzer(!viewAnalyzer);
    });

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', wudth: '100%' }}>
                <Box sx={{ flexGrow: 1 }}>
                    <TopBar playing={playing} setPlaying={setPlaying}>
                        <FileMenu
                            selected={selected}
                            setSelected={setSelected}
                            playing={playing}
                            setPlaying={setPlaying}
                        />
                        <AddMenu />
                        <RemoveMenu selected={selected} setSelected={setSelected} />
                        <ViewMenu
                            elements={[
                                {
                                    name: t('panel.network.title'),
                                    view: viewNetwork,
                                    setView: setViewNetwork,
                                    shortcut: 'Ctrl+Alt+Shift+N',
                                },
                                {
                                    name: t('panel.properties.title'),
                                    view: viewProperties,
                                    setView: setViewProperties,
                                    shortcut: 'Ctrl+Alt+Shift+P',
                                },
                                {
                                    name: t('panel.analyzer.title'),
                                    view: viewAnalyzer,
                                    setView: setViewAnalyzer,
                                    shortcut: 'Ctrl+Alt+Shift+A',
                                },
                            ]}
                        />
                        <HelpMenu />
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
