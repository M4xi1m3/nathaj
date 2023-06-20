import { Divider, Grid, Stack, Typography } from '@mui/material';
import React from 'react';

export const NetowrkProperties: React.FC = () => {
    return (
        <Grid container direction='column' flexWrap='nowrap' sx={{ height: '100%' }}>
            <Grid item sx={{ width: '100%' }}>
                <Stack sx={{ padding: '0px 8px', height: '32px' }} direction='row'>
                    <Stack direction='row' flexGrow={1}>
                        <Typography component='h2' variant='h6'>
                            Properties
                        </Typography>
                    </Stack>
                    <Stack direction='row'></Stack>
                </Stack>
                <Divider />
            </Grid>
        </Grid>
    );
};
