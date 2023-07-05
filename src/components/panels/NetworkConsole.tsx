import { Delete } from '@mui/icons-material';
import { Divider, Grid, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { saveJson } from '../../hooks/saveJson';
import { selectFile } from '../../hooks/selectFile';
import { NetworkContext } from '../../NetworkContext';
import { Terminal } from '../terminal/Terminal';

/**
 * Network console component
 */
export const NetworkConsole: React.FC<{
    selected: string | null;
    setSelected: (name: string | null) => void;
}> = ({ selected, setSelected }) => {
    const { t } = useTranslation();
    const network = useContext(NetworkContext);
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
                        clear: ({ command, args }, { clear, print }) => {
                            if (args.length !== 0) {
                                print(`Usage: ${command}`, 'error');
                                return;
                            }
                            clear();
                        },
                        print: ({ args }, { print }) => print(args.join(' ')),
                        start: ({ command, args }, { print }) => {
                            if (args.length !== 0) {
                                print(`Usage: ${command}`, 'error');
                                return;
                            }
                            try {
                                network.start();
                                print('Network started', 'success');
                            } catch (e: any) {
                                print((e as Error).message, 'error');
                            }
                        },
                        stop: ({ command, args }, { print }) => {
                            if (args.length !== 0) {
                                print(`Usage: ${command}`, 'error');
                                return;
                            }
                            try {
                                network.stop();
                                print('Network stopped', 'success');
                            } catch (e: any) {
                                print((e as Error).message, 'error');
                            }
                        },
                        reset: ({ command, args }, { print }) => {
                            if (args.length !== 0) {
                                print(`Usage: ${command}`, 'error');
                                return;
                            }
                            try {
                                network.reset();
                                print('Network reset', 'success');
                            } catch (e: any) {
                                print((e as Error).message, 'error');
                            }
                        },
                        destroy: ({ command, args }, { print }) => {
                            if (args.length !== 0) {
                                print(`Usage: ${command}`, 'error');
                                return;
                            }
                            try {
                                network.clear();
                                print('Network destroyed', 'success');
                            } catch (e: any) {
                                print((e as Error).message, 'error');
                            }
                        },
                        save: ({ command, args }, { print }) => {
                            if (args.length !== 1) {
                                print(`Usage: ${command} filename`, 'error');
                                return;
                            }
                            try {
                                saveJson(network.save(), args[0]);
                                print(`Network saved as ${args[0]}`, 'success');
                            } catch (e: any) {
                                print((e as Error).message, 'error');
                            }
                        },
                        load: ({ command, args }, { print }) => {
                            if (args.length !== 0) {
                                print(`Usage: ${command}`, 'error');
                                return;
                            }

                            const loadString = (data: string) => {
                                try {
                                    network.reset();
                                    network.load(JSON.parse(data));
                                    setSelected(null);
                                    print('Network loaded', 'success');
                                } catch (e: any) {
                                    print((e as Error).message, 'error');
                                }
                            };

                            selectFile('application/json', false).then((file: File | File[]) => {
                                if (file instanceof File) {
                                    file.arrayBuffer().then((buffer) => {
                                        const dec = new TextDecoder('utf-8');
                                        loadString(dec.decode(buffer));
                                    });
                                }
                            });
                        },
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
