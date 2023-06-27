import '@fontsource/righteous';
import '@fontsource/roboto-mono';
import type {} from '@mui/lab/themeAugmentation';
import { CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './assets/index.d';
import { Theme } from './components/Theme';
import './index.css';
import { NetworkContext } from './NetworkContext';
import { Vector2D } from './simulator/drawing/Vector2D';
import { Network } from './simulator/network/Network';
import { STPSwitch } from './simulator/network/peripherals/STPSwitch';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const net = new Network();

(window as any)['net'] = net;

new STPSwitch(net, 's1', '00:0b:00:00:00:01', 4);
new STPSwitch(net, 's2', '00:0b:00:00:00:02', 5);

net.addLink('s1', 's2');
net.getDevice('s1').setPosition(new Vector2D(0, 0));
net.getDevice('s2').setPosition(new Vector2D(200, 0));

root.render(
    <React.StrictMode>
        <Theme>
            <CssBaseline />
            <SnackbarProvider maxSnack={3}>
                <NetworkContext.Provider value={net}>
                    <App />
                </NetworkContext.Provider>
            </SnackbarProvider>
        </Theme>
    </React.StrictMode>
);
