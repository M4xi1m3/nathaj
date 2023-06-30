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
import { Network } from './simulator/network/Network';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const net = new Network();

/**
 * Trick to allow accessing the network from the js console
 */
(window as any)['net'] = net;

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
