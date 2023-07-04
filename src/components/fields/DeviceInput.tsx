import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { NetworkContext } from '../../NetworkContext';

interface PortsInputProps {
    device: string | null;
    setDevice: (device: string | null) => void;
}

export const DeviceInput: React.FC<PortsInputProps> = ({ device, setDevice }) => {
    const network = useContext(NetworkContext);
    const { t } = useTranslation();

    const handleChange = (event: SelectChangeEvent) => {
        const val = event.target.value as string;
        if (val === '') setDevice(null);
        else setDevice(val);
    };

    return (
        <FormControl fullWidth variant='standard'>
            <InputLabel>{t('field.device.label')}</InputLabel>
            <Select label={t('field.device.label')} onChange={handleChange} value={device === null ? '' : device}>
                {network.getDevices().map((dev, key) => (
                    <MenuItem value={dev.getName()} key={key}>
                        {dev.getName()}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};
