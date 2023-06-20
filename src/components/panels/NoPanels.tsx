import { Grid, Typography } from '@mui/material';
import React from 'react';

import { ReactComponent as Logo } from '../../assets/logo.svg';

export const NoPanels: React.FC = () => {
    return (
        <Grid container sx={{ height: '100%', width: '100%' }} justifyContent='center' alignItems='center'>
            <Grid item sx={{ width: '33%', height: '33%', maxWidth: '200px', textAlign: 'center' }}>
                <Logo style={{ width: '100%', maxHeight: '50%' }} />
                <Typography color='rgba(0,0,0,0.3)' variant='h4'>
                    Web-NetSim
                </Typography>
            </Grid>
        </Grid>
    );
};
