import { TextField } from '@mui/material';
import React from 'react';

const macRegexp = new RegExp('^(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$');

interface MacInputProps {
    mac: string;
    setMac: (mac: string) => void;
    setMacError?: (macError: boolean) => void;
}

export const MacInput: React.FC<MacInputProps> = ({ mac, setMac, setMacError }) => {
    let macError = !macRegexp.test(mac);
    if (!macError) {
        macError = (parseInt(mac.split(':')[0], 16) & 1) !== 0;
    }

    if (setMacError !== undefined) setMacError(macError);

    return (
        <TextField
            variant='standard'
            type='text'
            label='MAC address'
            fullWidth
            margin='dense'
            value={mac}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setMac(event.target.value);
            }}
            error={macError}
        />
    );
};
