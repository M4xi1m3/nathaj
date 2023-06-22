import {
    Divider,
    Grid,
    Stack,
    styled,
    Table,
    TableBody,
    TableCell,
    TableCellProps,
    TableRow,
    Typography,
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { NetworkContext } from '../../NetworkContext';
import { Device } from '../../simulator/network/peripherals/Device';
import { Host } from '../../simulator/network/peripherals/Host';

const PropCell = styled(TableCell)<TableCellProps>(() => ({
    '&.MuiTableCell-root': {
        padding: '0 8px',
        fontSize: '0.75em',
        whiteSpace: 'nowrap',
    },
}));

const PropValue = styled(TableCell)<TableCellProps>(() => ({
    '&.MuiTableCell-root': {
        padding: '0 8px',
        fontFamily: 'Roboto Mono',
        fontSize: '0.75em',
        whiteSpace: 'nowrap',
    },
}));

const HostProperties: React.FC<{
    dev: Host;
}> = ({ dev }) => {
    return (
        <>
            <Table>
                <TableBody>
                    <TableRow>
                        <PropCell>Type</PropCell>
                        <PropValue>Host</PropValue>
                    </TableRow>
                    <TableRow>
                        <PropCell>Name</PropCell>
                        <PropValue>{dev.getName()}</PropValue>
                    </TableRow>
                    <TableRow>
                        <PropCell>MAC Address</PropCell>
                        <PropValue>{dev.getMac()}</PropValue>
                    </TableRow>
                </TableBody>
            </Table>
            {dev.getInterfaces().map((intf, key) => (
                <React.Fragment key={key}>
                    <Typography variant='h6' sx={{ padding: '0 8px' }}>
                        Interface {intf.getName()}
                    </Typography>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <PropCell>Name</PropCell>
                                <PropValue>{intf.getFullName()}</PropValue>
                            </TableRow>
                            <TableRow>
                                <PropCell>Connected to</PropCell>
                                {intf.isConnected() ? (
                                    <PropValue>{intf.getConnection()?.getFullName()}</PropValue>
                                ) : (
                                    <PropCell sx={{ fontStyle: 'italic' }}>Not connected</PropCell>
                                )}
                            </TableRow>
                        </TableBody>
                    </Table>
                </React.Fragment>
            ))}
        </>
    );
};

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
            console.log('changed');
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
                {dev === null ? 'no selection' : dev instanceof Host ? <HostProperties dev={dev} /> : <></>}
            </Grid>
        </Grid>
    );
};
