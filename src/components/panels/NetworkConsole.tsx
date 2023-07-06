import { Divider, Grid, Stack, Typography, useTheme } from '@mui/material';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { saveJson } from '../../hooks/saveJson';
import { selectFile } from '../../hooks/selectFile';
import { NetworkContext } from '../../NetworkContext';
import { Host } from '../../simulator/network/peripherals/Host';
import { Hub } from '../../simulator/network/peripherals/Hub';
import { STPSwitch } from '../../simulator/network/peripherals/STPSwitch';
import { Switch } from '../../simulator/network/peripherals/Switch';
import { Mac } from '../../simulator/utils/Mac';
import { CommandFunc, Terminal } from '../terminal/Terminal';

/**
 * Network console component
 */
export const NetworkConsole: React.FC = () => {
    const { t } = useTranslation();
    const network = useContext(NetworkContext);
    const theme = useTheme();

    const dev_subcommand: { [name: string]: CommandFunc } = {
        add: ({ args }, { print }) => {
            if (args.length < 1) {
                print(`Usage: dev add type [name] [mac] [ports]`, 'error');
                return;
            }

            if (args[1] === '-') args[1] = undefined;
            if (args[2] === '-') args[2] = undefined;
            if (args[3] === '-') args[3] = undefined;

            if (args[2] !== undefined && !Mac.isValid(args[2])) {
                print(`Invalid mac address ${args[2]}`, 'error');
                return;
            }

            if (args[3] !== undefined && isNaN(parseInt(args[3]))) {
                print(`Invalid port count ${args[3]}`, 'error');
                return;
            }
            const ports = args[3] !== undefined ? parseInt(args[3]) : undefined;

            try {
                switch (args[0]) {
                    case 'host':
                        new Host(network, args[1], args[2]);
                        print('Host added', 'success');
                        break;
                    case 'hub':
                        new Hub(network, args[1], args[2], ports);
                        print('Hub added', 'success');
                        break;
                    case 'switch':
                        new Switch(network, args[1], args[2], ports);
                        print('Switch added', 'success');
                        break;
                    case 'stp-switch':
                        new STPSwitch(network, args[1], args[2], ports);
                        print('STP Switch added', 'success');
                        break;
                    default:
                        print(`Unknown device type ${args[0]}`, 'error');
                        break;
                }
            } catch (e: any) {
                print((e as Error).message, 'error');
            }
        },
        remove: ({ args }, { print }) => {
            if (args.length < 1) {
                print(`Usage: dev remove name`, 'error');
                return;
            }

            try {
                network.removeDevice(args[0]);
                print('Device removed', 'success');
            } catch (e: any) {
                print((e as Error).message, 'error');
            }
        },
        link: ({ args }, { print }) => {
            if (args.length < 2) {
                print(`Usage: dev link device other`, 'error');
                return;
            }

            try {
                network.addLink(args[0], args[1]);
                print('Link added', 'success');
            } catch (e: any) {
                print((e as Error).message, 'error');
            }
        },
        unlink: ({ args }, { print }) => {
            if (args.length < 2) {
                print(`Usage: dev unlink device other`, 'error');
                return;
            }

            try {
                network.removeLink(args[0], args[1]);
                print('Link removed', 'success');
            } catch (e: any) {
                print((e as Error).message, 'error');
            }
        },
        intf: (c, f) => {
            if (c.args.length === 0 || !(c.args[0] in intf_subcommand)) {
                f.print(`Usage: dev intf command ...args`, 'error');
                return;
            }
            intf_subcommand[c.args.shift()](c, f);
        },
        help: (_, { print }) => {
            print('Available commands:');
            print('dev help        Show this help');
            print('dev add         Add a device');
            print('dev remove      Remove a device');
            print('dev link        Link two devices');
            print('dev unlink      Unlink two devices');
            print('dev intf        Manage interfaces');
            print('dev intf help   Show interfaces help');
        },
    };

    const intf_subcommand: { [name: string]: CommandFunc } = {
        add: ({ args }, { print }) => {
            if (args.length < 1) {
                print(`Usage: dev intf add device [name] [mac]`, 'error');
                return;
            }

            if (args[1] === '-') args[1] = undefined;
            if (args[2] === '-') args[2] = undefined;

            if (args[2] !== undefined && !Mac.isValid(args[2])) {
                print(`Invalid mac address ${args[2]}`, 'error');
                return;
            }

            try {
                network.getDevice(args[0]).addInterface(args[1], args[2]);
                print('Interface added', 'success');
            } catch (e: any) {
                print((e as Error).message, 'error');
            }
        },
        remove: ({ args }, { print }) => {
            if (args.length < 2) {
                print(`Usage: dev intf remove device name`, 'error');
                return;
            }

            try {
                network.getDevice(args[0]).removeInterface(args[1]);
                print('Interface removed', 'success');
            } catch (e: any) {
                print((e as Error).message, 'error');
            }
        },
        link: ({ args }, { print }) => {
            if (args.length < 4) {
                print(`Usage: dev intf link device interface other intf`, 'error');
                return;
            }

            try {
                network.addLink(args[0], args[1], args[2], args[3]);
                print('Link added', 'success');
            } catch (e: any) {
                print((e as Error).message, 'error');
            }
        },
        unlink: ({ args }, { print }) => {
            if (args.length < 4) {
                print(`Usage: dev intf unlink device interface other intf`, 'error');
                return;
            }

            try {
                network.removeLink(args[0], args[1], args[2], args[3]);
                print('Link removed', 'success');
            } catch (e: any) {
                print((e as Error).message, 'error');
            }
        },
        help: (_, { print }) => {
            print('Available commands:');
            print('dev intf help       Show this help');
            print('dev intf add        Add an interface');
            print('dev intf remove     Remove an interface');
            print('dev intf link       Link two interfaces');
            print('dev intf unlink     Unlink two interfaces');
        },
    };

    return (
        <Grid container direction='column' flexWrap='nowrap' sx={{ height: '100%' }}>
            <Grid item sx={{ width: '100%' }}>
                <Stack sx={{ padding: '0px 8px', height: '32px' }} direction='row'>
                    <Stack direction='row' flexGrow={1}>
                        <Typography component='h2' variant='h6'>
                            {t('panel.console.title')}
                        </Typography>
                    </Stack>
                </Stack>
                <Divider />
            </Grid>
            {/* TODO: Find a way to do that without using calc with a fixed height */}
            <Grid item sx={{ height: '100%', overflow: 'hidden' }}>
                <Terminal
                    commands={{
                        dev: (c, f) => {
                            if (c.args.length === 0 || !(c.args[0] in dev_subcommand)) {
                                f.print(`Usage: dev command ...args`, 'error');
                                return;
                            }
                            dev_subcommand[c.args.shift()](c, f);
                        },
                        clear: ({ args }, { clear, print }) => {
                            if (args.length !== 0) {
                                print(`Usage: clear`, 'error');
                                return;
                            }
                            clear();
                        },
                        start: ({ args }, { print }) => {
                            if (args.length !== 0) {
                                print(`Usage: start`, 'error');
                                return;
                            }
                            try {
                                network.start();
                                print('Network started', 'success');
                            } catch (e: any) {
                                print((e as Error).message, 'error');
                            }
                        },
                        stop: ({ args }, { print }) => {
                            if (args.length !== 0) {
                                print(`Usage: stop`, 'error');
                                return;
                            }
                            try {
                                network.stop();
                                print('Network stopped', 'success');
                            } catch (e: any) {
                                print((e as Error).message, 'error');
                            }
                        },
                        reset: ({ args }, { print }) => {
                            if (args.length !== 0) {
                                print(`Usage: reset`, 'error');
                                return;
                            }
                            try {
                                network.reset();
                                print('Network reset', 'success');
                            } catch (e: any) {
                                print((e as Error).message, 'error');
                            }
                        },
                        destroy: ({ args }, { print }) => {
                            if (args.length !== 0) {
                                print(`Usage: destroy`, 'error');
                                return;
                            }
                            try {
                                network.clear();
                                print('Network destroyed', 'success');
                            } catch (e: any) {
                                print((e as Error).message, 'error');
                            }
                        },
                        save: ({ args }, { print }) => {
                            if (args.length !== 1) {
                                print(`Usage: save filename`, 'error');
                                return;
                            }
                            try {
                                saveJson(network.save(), args[0]);
                                print(`Network saved as ${args[0]}`, 'success');
                            } catch (e: any) {
                                print((e as Error).message, 'error');
                            }
                        },
                        load: ({ args }, { print }) => {
                            if (args.length !== 0) {
                                print(`Usage: load`, 'error');
                                return;
                            }

                            const loadString = (data: string) => {
                                try {
                                    network.reset();
                                    network.load(JSON.parse(data));
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
                        help: (_, { print }) => {
                            print('Available commands:');
                            print('help            Show this help');
                            print('clear           Clear the console');
                            print('start           Start the simulation');
                            print('stop            Stop the simulation');
                            print('reset           Reset the simulation');
                            print('destroy         Destroy the network');
                            print('save            Save the network');
                            print('load            Load a network');
                            print('dev             Manage devices');
                            print('dev help        Show device help');
                            print('dev intf help   Show interfaces help');
                        },
                    }}
                    theme={{
                        background: 'rgba(0, 0, 0, 0)',
                        text: theme.palette.text.primary,
                        border: theme.palette.text.primary,
                        success: theme.palette.success.main,
                        error: theme.palette.error.main,
                        warning: theme.palette.warning.main,
                    }}
                    notFound={({ command }, { print }) => {
                        print(
                            `Command ${command} not found!\nType "help" to get a list of available commands.`,
                            'error'
                        );
                    }}
                    initval={`Näthaj console\nType "help" for a list of available commands.`}
                />
            </Grid>
        </Grid>
    );
};
