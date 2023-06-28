import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import { NetworkContext } from '../../NetworkContext';
import { Host } from '../../simulator/network/peripherals/Host';
import { MacInput } from '../fields/MacInput';
import { NameInput } from '../fields/NameInput';

interface AddHostDialogProps {
    close: () => void;
    opened: boolean;
}

export const AddHostDialog: React.FC<AddHostDialogProps> = ({ opened, close }) => {
    const network = useContext(NetworkContext);

    const { enqueueSnackbar } = useSnackbar();

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);

    const [mac, setMac] = useState<string>('');
    const [macError, setMacError] = useState<boolean>(false);

    useEffect(() => {
        setName(Host.getNextAvailableName(network));
        setMac('');
    }, [opened, setName, setMac]);

    return (
        <Dialog open={opened} onClose={() => close()} maxWidth='sm' fullWidth={true}>
            <DialogTitle>Add Host</DialogTitle>
            <DialogContent>
                <NameInput name={name} setName={setName} setNameError={setNameError} nameError={nameError} />
                <MacInput mac={mac} setMac={setMac} setMacError={setMacError} macError={macError} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()}>Cancel</Button>
                <Button
                    onClick={() => {
                        try {
                            new Host(network, name, mac);
                            enqueueSnackbar('Host ' + name + ' added');
                        } catch (e: any) {
                            enqueueSnackbar((e as Error).message, { variant: 'error' });
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
