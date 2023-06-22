import { Divider, Grid, Stack, Typography } from '@mui/material';
import React, { useContext } from 'react';
import { NetworkContext } from '../../NetworkContext';

export const NetowrkProperties: React.FC<{
    selected: string | null;
}> = ({ selected }) => {
    const network = useContext(NetworkContext);

    let dev = null;
    if (selected !== null && network.hasDevice(selected)) {
        dev = network.getDevice(selected);
    }

    return (
        <Grid container direction='column' flexWrap='nowrap' sx={{ height: '100%' }}>
            <Grid item sx={{ width: '100%' }}>
                <Stack sx={{ padding: '0px 8px', height: '32px' }} direction='row'>
                    <Stack direction='row' flexGrow={1}>
                        <Typography component='h2' variant='h6'>
                            {dev === null ? 'Properties' : 'Properties of ' + dev.getName()}
                        </Typography>
                    </Stack>
                    <Stack direction='row'></Stack>
                </Stack>
                <Divider />
            </Grid>
            <Grid item sx={{ flexGrow: 1, width: '100%', position: 'relative' }}>
                {dev === null ? 'no selection' : ''}
            </Grid>
        </Grid>
    );
};
