import { Shuffle } from '@mui/icons-material';
import { FormControl, FormHelperText, IconButton, Input, InputAdornment, InputLabel } from '@mui/material';
import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NetworkContext } from '../../NetworkContext';

const macRegexp = new RegExp('^(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$');

interface MacInputProps {
    mac: string;
    setMac: (mac: string) => void;
    setMacError: (macError: boolean) => void;
    macError: boolean;
}

export const MacInput: React.FC<MacInputProps> = ({ mac, setMac, setMacError, macError }) => {
    const { t } = useTranslation();
    const network = useContext(NetworkContext);

    const randomize = () => {
        const addr = [];
        addr.push(Math.floor(Math.random() * 256) & 0xfe);
        addr.push(Math.floor(Math.random() * 256) & 0xff);
        addr.push(Math.floor(Math.random() * 256) & 0xff);
        addr.push(Math.floor(Math.random() * 256) & 0xff);
        addr.push(Math.floor(Math.random() * 256) & 0xff);
        addr.push(Math.floor(Math.random() * 256) & 0xff);

        setMac(addr.map((n) => n.toString(16).padStart(2, '0')).join(':'));
        setMacError(false);
    };

    useEffect(() => {
        let macError = !macRegexp.test(mac);
        if (!macError) {
            macError = (parseInt(mac.split(':')[0], 16) & 1) !== 0;
        }
        setMacError(macError);
    }, [mac, setMacError]);

    return (
        <FormControl fullWidth margin='dense' error={macError} variant='standard'>
            <InputLabel>{t('field.mac.label')}</InputLabel>
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
            {network.isMACUsed(mac) ? <FormHelperText>{t('field.mac.used')}</FormHelperText> : <></>}
        </FormControl>
    );
};
