import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { NetworkContext } from '../../NetworkContext';
import { Host } from '../../simulator/network/peripherals/Host';
import { useSnackbar } from 'notistack';

const macRegexp = new RegExp('^(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$');

interface AddHostDialogProps {
    close: () => void;
    opened: boolean;
}

export const AddHostDialog: React.FC<AddHostDialogProps> = ({ opened, close }) => {
    const network = useContext(NetworkContext);

    const { enqueueSnackbar } = useSnackbar();

    const [name, setName] = useState<string>('');
    const nameError = name === '' || network.hasDevice(name);
    const [mac, setMac] = useState<string>('');
    let macError = !macRegexp.test(mac);
    if (!macError) {
        macError = (parseInt(mac.split(':')[0], 16) & 1) !== 0;
    }

    useEffect(() => {
        setName('');
        setMac('');
    }, [opened, setName, setMac]);

    return (
        <Dialog open={opened} onClose={() => close()}>
            <DialogTitle>Add Host</DialogTitle>
            <DialogContent>
                <TextField
                    variant='standard'
                    type='text'
                    label='Name'
                    fullWidth
                    margin='dense'
                    value={name}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setName(event.target.value);
                    }}
                    error={nameError}
                />
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
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()}>Cancel</Button>
                <Button
                    onClick={() => {
                        try {
                            new Host(network, name, mac);
                        } catch (e: any) {
                            enqueueSnackbar((e as Error).message, { variant: 'error' });
                            console.error((e as Error).message);
                        }
                        close();
                    }}
                    disabled={nameError || macError}>
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
};
