import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import React from 'react';
import { NetworkActions } from './NetworkActions';

import { ReactComponent as Logo } from '../assets/logo/logo.svg';
import { LightDarkSwitch } from './Theme';

export const TopBar: React.FC<{
    children: React.ReactNode;
    playing: boolean;
    setPlaying: (playing: boolean) => void;
}> = ({ children, playing, setPlaying }) => {
    return (
        <AppBar position='static' enableColorOnDark>
            <Toolbar variant='dense'>
                <Logo style={{ display: 'flex', height: '40px', width: '40px', marginRight: '8px' }} />
                <Typography
                    variant='h5'
                    component='div'
                    sx={{
                        mr: 2,
                        mt: '-4px',
                        display: 'flex',
                        fontFamily: 'Righteous',
                    }}>
                    Näthaj
                </Typography>
                <Box sx={{ flexGrow: 1, display: 'flex' }}>{children}</Box>
                <NetworkActions playing={playing} setPlaying={setPlaying} />
                <LightDarkSwitch />
            </Toolbar>
        </AppBar>
    );
};
