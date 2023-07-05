import { Delete } from '@mui/icons-material';
import { Divider, Grid, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Terminal } from '../terminal/Terminal';

/**
 * Network console component
 */
export const NetworkConsole: React.FC = () => {
    const { t } = useTranslation();
    const theme = useTheme();

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
            {/* TODO: Find a way to do that without using calc with a fixed height */}
            {/*
                Command list:
                 - start
                 - stop
                 - reset
                 - destroy
                 - save <filename>
                 - load
                 - example load <path>
                 - example list
                 - show <panel>
                 - hide <panel>
                 - dev add <type> <name> <mac>
                 - dev remove <name>
                 - dev link <a> <b>
                 - dev unlink <a> <b>
                 - dev set <name> <prop> <value>
                 - dev get <name> <prop>
                 - dev info <name>
                 - dev intf add <name> <intf> <mac>
                 - dev intf remove <name> <intf>
                 - dev intf link <a> <intfa> <b> <intfb>
                 - dev intf unlink <a> <intfa> <b> <intfb>
                 - dev intf get <name> <intf> <prop>
                 - dev intf set <name> <intf> <prop> <value>
                 - dev intf info <name> <intf>
            */}
            <Grid item sx={{ height: '100%', overflow: 'hidden' }}>
                <Terminal
                    commands={{
                        clear: (c, { clear }) => clear(),
                        print: ({ args }, { print }) => print(args.join(' ')),
                    }}
                    theme={{
                        background: 'rgba(0, 0, 0, 0)',
                        text: theme.palette.text.primary,
                        border: theme.palette.text.primary,
                        success: theme.palette.success.main,
                        error: theme.palette.error.main,
                    }}
                />
            </Grid>
        </Grid>
    );
};
