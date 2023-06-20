import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import React from 'react';
import { NetworkActions } from './NetworkActions';

export const TopBar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <AppBar position='static'>
            <Toolbar variant='dense'>
                <Typography
                    variant='h6'
                    component='div'
                    sx={{
                        mr: 2,
                        display: 'flex',
                        fontWeight: 700,
                    }}>
                    Web-NetSim
                </Typography>
                <Box sx={{ flexGrow: 1, display: 'flex' }}>{children}</Box>
                <NetworkActions />
            </Toolbar>
        </AppBar>
    );
};
