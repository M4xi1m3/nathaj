import { Grid, Typography } from '@mui/material';
import React from 'react';

import { ReactComponent as LogoLight } from '../../assets/logo/light.svg';

import packageJson from '../../../package.json';

export const NoPanels: React.FC = () => {
    return (
        <Grid container sx={{ height: '100%', width: '100%' }} justifyContent='center' alignItems='center'>
            <Grid item sx={{ width: '50%', maxWidth: '200px', textAlign: 'center' }}>
                <LogoLight style={{ width: '100%', filter: 'grayscale(100%) opacity(50%)' }} />
                <Typography sx={{ fontFamily: 'Righteous', filter: 'opacity(40%)' }} variant='h3'>
                    Näthaj
                </Typography>
                <Typography sx={{ fontFamily: 'Righteous', filter: 'opacity(40%)' }} variant='h5'>
                    Version {packageJson.version}
                </Typography>
            </Grid>
        </Grid>
    );
};
