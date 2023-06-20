import { FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import React, { useContext, useEffect } from 'react';
import { NetworkContext } from '../../NetworkContext';

interface PortsInputProps {
    device: string | null;
    setDevice: (device: string | null) => void;
    intf: string | null;
    setIntf: (intf: string | null) => void;
    exclude?: [
        {
            device: string | null;
            intf: string | null;
        }
    ];
}

export const InterfaceInput: React.FC<PortsInputProps> = ({ device, setDevice, intf, setIntf, exclude }) => {
    const network = useContext(NetworkContext);

    const handleDeviceChange = (event: SelectChangeEvent) => {
        const val = event.target.value as string;
        if (val === '') setDevice(null);
        else setDevice(val);
    };

    const handleIntfChange = (event: SelectChangeEvent) => {
        const val = event.target.value as string;
        if (val === '') setIntf(null);
        else setIntf(val);
    };

    useEffect(() => {
        setIntf(null);
    }, [device, setIntf]);

    return (
        <Grid container columnSpacing={2}>
            <Grid item xs={6}>
                <FormControl fullWidth variant='standard'>
                    <InputLabel>Device</InputLabel>
                    <Select label='Device' onChange={handleDeviceChange} value={device === null ? '' : device}>
                        {network.getDevices().map((dev, key) => (
                            <MenuItem value={dev.getName()} disabled={!dev.hasFreeInterface()} key={key}>
                                {dev.getName()}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6}>
                <FormControl fullWidth variant='standard'>
                    <InputLabel>Interface</InputLabel>
                    <Select
                        label='Interface'
                        onChange={handleIntfChange}
                        value={intf === null ? '' : intf}
                        disabled={device === null}>
                        {device !== null
                            ? network
                                  .getDevice(device)
                                  .getInterfaces()
                                  .map((intf, key) => (
                                      <MenuItem
                                          value={intf.getName()}
                                          disabled={
                                              intf.isConnected() ||
                                              (exclude !== undefined
                                                  ? exclude.find(
                                                        (value) =>
                                                            value.device === device && value.intf === intf.getName()
                                                    ) !== undefined
                                                  : false)
                                          }
                                          key={key}>
                                          {intf.getName()}
                                      </MenuItem>
                                  ))
                            : null}
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
    );
};
