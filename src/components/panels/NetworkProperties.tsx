import { Divider, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NicPlus } from '../../icons/NicPlus';
import { NetworkContext } from '../../NetworkContext';
import { Device } from '../../simulator/network/peripherals/Device';
import { Host } from '../../simulator/network/peripherals/Host';
import { Hub } from '../../simulator/network/peripherals/Hub';
import { STPSwitch } from '../../simulator/network/peripherals/STPSwitch';
import { Switch } from '../../simulator/network/peripherals/Switch';
import { AddInterfaceDialog } from '../dialogs/AddInterfaceDialog';
import { BaseProperties } from '../properties/devs/BaseProperties';
import { HostProperties } from '../properties/devs/HostProperties';
import { HubProperties } from '../properties/devs/HubProperties';
import { StpSwitchProperties } from '../properties/devs/StpSwitchProperties';
import { SwitchProperties } from '../properties/devs/SwitchProperties';

export const NetowrkProperties: React.FC<{
    selected: string | null;
}> = ({ selected }) => {
    const { t } = useTranslation();
    const network = useContext(NetworkContext);
    const [addInterfaceOpened, setAddInterfaceOpened] = useState(false);

    let dev: null | Device = null;
    if (selected !== null && network.hasDevice(selected)) {
        dev = network.getDevice(selected);
    }

    // TODO: Envie de crever
    const [chg, setChg] = useState(0);
    useEffect(() => {
        const handleChanged = () => {
            setChg(chg + 1);
        };

        if (dev !== null) {
            dev.addEventListener('changed', handleChanged);
        }

        return () => {
            if (dev !== null) {
                dev.removeEventListener('changed', handleChanged);
            }
        };
    }, [dev, setChg, chg]);

    return (
        <>
            <AddInterfaceDialog opened={addInterfaceOpened} close={() => setAddInterfaceOpened(false)} device={dev} />

            <Grid container direction='column' flexWrap='nowrap' sx={{ height: '100%', width: '100%' }}>
                <Grid item sx={{ width: '100%' }}>
                    <Stack sx={{ padding: '0px 8px', height: '32px' }} direction='row'>
                        <Stack direction='row' flexGrow={1}>
                            <Typography component='h2' variant='h6' sx={{ whiteSpace: 'nowrap' }}>
                                {dev === null
                                    ? t('panel.properties.title')
                                    : t('panel.properties.titleof', { name: dev.getName() })}
                            </Typography>
                        </Stack>
                        <Stack direction='row'>
                            {dev === null ? null : (
                                <Tooltip title={t('panel.properties.action.addintf')}>
                                    <IconButton size='small' edge='end' onClick={() => setAddInterfaceOpened(true)}>
                                        <NicPlus color='action' />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Stack>
                    </Stack>
                    <Divider />
                </Grid>
                <Grid item sx={{ height: '100%', overflowY: 'auto' }}>
                    {dev === null ? (
                        <Typography
                            paragraph
                            sx={{
                                fontStyle: 'italic',
                                color: 'text.secondary',
                                textAlign: 'center',
                                marginTop: '8px',
                            }}
                            variant='caption'>
                            {t('panel.properties.nodevice')}
                        </Typography>
                    ) : dev instanceof Host ? (
                        <HostProperties dev={dev} />
                    ) : dev instanceof STPSwitch ? (
                        <StpSwitchProperties dev={dev} />
                    ) : dev instanceof Switch ? (
                        <SwitchProperties dev={dev} />
                    ) : dev instanceof Hub ? (
                        <HubProperties dev={dev} />
                    ) : (
                        <BaseProperties dev={dev} />
                    )}
                </Grid>
            </Grid>
        </>
    );
};
