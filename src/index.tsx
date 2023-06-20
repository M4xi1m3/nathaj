import '@fontsource/roboto-mono';
import type {} from '@mui/lab/themeAugmentation';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { NetworkContext } from './NetworkContext';
import { Layout } from './simulator/drawing/Layout';
import { Network } from './simulator/network/Network';
import { STPSwitch } from './simulator/network/peripherals/STPSwitch';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const net = new Network();

new STPSwitch(net, 's1', '00:0b:00:00:00:01', 5);
new STPSwitch(net, 's2', '00:0b:00:00:00:02', 5);

net.addLink('s1', 's2');

Layout.spring_layout(net);

root.render(
    <React.StrictMode>
        <SnackbarProvider maxSnack={3}>
            <NetworkContext.Provider value={net}>
                <App />
            </NetworkContext.Provider>
        </SnackbarProvider>
    </React.StrictMode>
);
