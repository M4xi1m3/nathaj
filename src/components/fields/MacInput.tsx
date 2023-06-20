import { Shuffle } from '@mui/icons-material';
import { FormControl, FormHelperText, IconButton, Input, InputAdornment, InputLabel } from '@mui/material';
import React, { useContext } from 'react';
import { NetworkContext } from '../../NetworkContext';

const macRegexp = new RegExp('^(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$');

interface MacInputProps {
    mac: string;
    setMac: (mac: string) => void;
    setMacError?: (macError: boolean) => void;
}

export const MacInput: React.FC<MacInputProps> = ({ mac, setMac, setMacError }) => {
    const network = useContext(NetworkContext);

    let macError = !macRegexp.test(mac);
    if (!macError) {
        macError = (parseInt(mac.split(':')[0], 16) & 1) !== 0;
    }

    if (setMacError !== undefined) setMacError(macError);

    const randomize = () => {
        const addr = [];
        addr.push(Math.floor(Math.random() * 256) & 0xfe);
        addr.push(Math.floor(Math.random() * 256) & 0xff);
        addr.push(Math.floor(Math.random() * 256) & 0xff);
        addr.push(Math.floor(Math.random() * 256) & 0xff);
        addr.push(Math.floor(Math.random() * 256) & 0xff);
        addr.push(Math.floor(Math.random() * 256) & 0xff);

        setMac(addr.map((n) => n.toString(16).padStart(2, '0')).join(':'));
    };

    return (
        <FormControl fullWidth margin='dense' error={macError} variant='standard'>
            <InputLabel>MAC address</InputLabel>
            <Input
                type='text'
                value={mac}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setMac(event.target.value);
                }}
                endAdornment={
                    <InputAdornment position='end'>
                        <IconButton edge='end' onClick={randomize}>
                            <Shuffle />
                        </IconButton>
                    </InputAdornment>
                }
            />
            {network.isMACUsed(mac) ? <FormHelperText>Warning: MAC address already in use</FormHelperText> : <></>}
        </FormControl>
    );
};
