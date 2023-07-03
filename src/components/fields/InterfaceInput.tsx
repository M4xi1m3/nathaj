import { FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NetworkContext } from '../../NetworkContext';
import { Device } from '../../simulator/network/peripherals/Device';

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
    connectedTo?: [
        {
            device: string | null;
            intf: string | null;
        }
    ];
    free?: boolean;
    connected?: boolean;
    devFilter?: (dev: Device) => boolean;
}

export const InterfaceInput: React.FC<PortsInputProps> = ({
    device,
    setDevice,
    intf,
    setIntf,
    exclude,
    connectedTo,
    free,
    connected,
    devFilter,
}) => {
    const network = useContext(NetworkContext);
    const { t } = useTranslation();

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
                    <InputLabel>{t('field.device.label')}</InputLabel>
                    <Select
                        label={t('field.device.label')}
                        onChange={handleDeviceChange}
                        value={device === null ? '' : device}>
                        {(devFilter === undefined ? network.getDevices() : network.getDevices().filter(devFilter)).map(
                            (dev, key) => (
                                <MenuItem
                                    value={dev.getName()}
                                    disabled={
                                        (free === true ? !dev.hasFreeInterface() : false) ||
                                        (connected === true ? !dev.hasConnectedInterface() : false)
                                    }
                                    key={key}>
                                    {dev.getName()}
                                </MenuItem>
                            )
                        )}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6}>
                <FormControl fullWidth variant='standard'>
                    <InputLabel>{t('field.interface.label')}</InputLabel>
                    <Select
                        label={t('field.interface.label')}
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
                                              (free === true ? intf.isConnected() : false) ||
                                              (connected === true ? !intf.isConnected() : false) ||
                                              (exclude !== undefined
                                                  ? exclude.find(
                                                        (value) =>
                                                            value.device === device && value.intf === intf.getName()
                                                    ) !== undefined
                                                  : false) ||
                                              (connectedTo !== undefined
                                                  ? intf.isConnected()
                                                      ? connectedTo.find(
                                                            (value) =>
                                                                value.device ===
                                                                    intf.getConnection()?.getOwner().getName() &&
                                                                value.intf === intf.getConnection()?.getName()
                                                        ) === undefined
                                                      : true
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
