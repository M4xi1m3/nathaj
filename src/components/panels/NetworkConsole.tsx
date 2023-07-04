import { Delete } from '@mui/icons-material';
import { Divider, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Network console component
 */
export const NetworkConsole: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Grid container direction='column' flexWrap='nowrap' sx={{ height: '100%' }}>
            <Grid item sx={{ width: '100%' }}>
                <Stack sx={{ padding: '0px 8px', height: '32px' }} direction='row'>
                    <Stack direction='row' flexGrow={1}>
                        <Typography component='h2' variant='h6'>
                            {t('panel.console.title')}
                        </Typography>
                    </Stack>
                    <Stack direction='row'>
                        <Tooltip title={t('panel.console.action.clear')}>
                            <IconButton size='small'>
                                <Delete color='error' />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>
                <Divider />
            </Grid>
            <Grid item></Grid>
        </Grid>
    );
};
