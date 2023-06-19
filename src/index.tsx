import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '@fontsource/roboto-mono';
import type {} from '@mui/lab/themeAugmentation';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
