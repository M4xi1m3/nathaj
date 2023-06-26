import { ToggleOff, ToggleOn } from '@mui/icons-material';
import { Divider, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { NetworkContext } from '../../NetworkContext';
import { Device } from '../../simulator/network/peripherals/Device';
import { Host } from '../../simulator/network/peripherals/Host';
import { Hub } from '../../simulator/network/peripherals/Hub';
import { PortRole, PortState, STPInterface, STPSwitch } from '../../simulator/network/peripherals/STPSwitch';
import { Switch } from '../../simulator/network/peripherals/Switch';
import { IntProperty } from '../properties/IntProperty';
import { MACAddressTableProperty } from '../properties/MACAddressTableProperty';
import { MACProperty } from '../properties/MACProperty';
import { InterfaceProperties, Properties } from '../properties/Properties';
import { Property } from '../properties/Property';

export const NetowrkProperties: React.FC<{
    selected: string | null;
}> = ({ selected }) => {
    const network = useContext(NetworkContext);
    const [chg, setChg] = useState(0);

    let dev: null | Device = null;
    if (selected !== null && network.hasDevice(selected)) {
        dev = network.getDevice(selected);
    }

    // TODO: Envie de crever
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
        <Grid container direction='column' flexWrap='nowrap' sx={{ height: '100%', width: '100%' }}>
            <Grid item sx={{ width: '100%' }}>
                <Stack sx={{ padding: '0px 8px', height: '32px' }} direction='row'>
                    <Stack direction='row' flexGrow={1}>
                        <Typography component='h2' variant='h6' sx={{ whiteSpace: 'nowrap' }}>
                            {dev === null ? 'Properties' : 'Properties of ' + dev.getName()}
                        </Typography>
                    </Stack>
                    <Stack direction='row'></Stack>
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
                        No device selected
                    </Typography>
                ) : dev instanceof Host ? (
                    <>
                        <Properties>
                            <Property label='Type' value='Host' />
                            <Property label='Name' value={dev.getName()} />
                            <MACProperty dev={dev} />
                        </Properties>
                        <InterfaceProperties dev={dev} />
                    </>
                ) : dev instanceof STPSwitch ? (
                    <>
                        <Properties>
                            <Property label='Type' value='STP Switch' />
                            <Property label='Name' value={dev.getName()} />
                            <MACProperty dev={dev} />
                            <IntProperty
                                label='Priority'
                                value={dev.getPriority()}
                                setValue={(v) => (dev as STPSwitch).setPriority(v)}
                                min={0}
                                max={65536}
                            />
                        </Properties>
                        <MACAddressTableProperty dev={dev} />
                        <InterfaceProperties
                            dev={dev}
                            properties={(intf: STPInterface) => (
                                <>
                                    <Property label='Role' value={PortRole[intf.role]} />
                                    <Property label='State' value={PortState[intf.state]} />
                                    <IntProperty
                                        label='Cost'
                                        value={intf.path_cost}
                                        setValue={(v) => intf.setCost(v)}
                                        min={0}
                                    />
                                </>
                            )}
                            actions={(intf: STPInterface) =>
                                intf.state === PortState.Disabled ? (
                                    <Tooltip title='Enable'>
                                        <IconButton onClick={() => intf.enable()}>
                                            <ToggleOff color='error' sx={{ fontSize: '16px' }} />
                                        </IconButton>
                                    </Tooltip>
                                ) : (
                                    <Tooltip title='Disable'>
                                        <IconButton onClick={() => intf.disable()}>
                                            <ToggleOn color='primary' sx={{ fontSize: '16px' }} />
                                        </IconButton>
                                    </Tooltip>
                                )
                            }
                        />
                    </>
                ) : dev instanceof Switch ? (
                    <>
                        <Properties>
                            <Property label='Type' value='Switch' />
                            <Property label='Name' value={dev.getName()} />
                            <MACProperty dev={dev} />
                        </Properties>
                        <MACAddressTableProperty dev={dev} />
                        <InterfaceProperties dev={dev} />
                    </>
                ) : dev instanceof Hub ? (
                    <>
                        <Properties>
                            <Property label='Type' value='Hub' />
                            <Property label='Name' value={dev.getName()} />
                        </Properties>
                        <InterfaceProperties dev={dev} />
                    </>
                ) : (
                    <>
                        <Properties>
                            <Property label='Type' value='Device' />
                            <Property label='Name' value={dev.getName()} />
                        </Properties>
                        <InterfaceProperties dev={dev} />
                    </>
                )}
            </Grid>
        </Grid>
    );
};
