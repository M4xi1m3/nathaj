import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { Device } from '../../simulator/network/peripherals/Device';
import { InterfaceNameInput } from '../fields/InterfaceNameInput';
import { MacInput } from '../fields/MacInput';

interface AddInterfaceDialogProps {
    close: () => void;
    opened: boolean;
    device: Device;
}

export const AddInterfaceDialog: React.FC<AddInterfaceDialogProps> = ({ opened, close, device }) => {
    const { enqueueSnackbar } = useSnackbar();

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);

    const [mac, setMac] = useState<string>('');
    const [macError, setMacError] = useState<boolean>(false);

    useEffect(() => {
        setName('');
        setNameError(true);
        setMac(device === null ? '' : device.generateNextMacAddress());
    }, [opened, setName, setNameError, setMac, setMacError, device]);

    return (
        <Dialog open={opened} onClose={() => close()} maxWidth='sm' fullWidth={true}>
            <DialogTitle>Add Interface</DialogTitle>
            <DialogContent>
                <InterfaceNameInput
                    name={name}
                    setName={setName}
                    setNameError={setNameError}
                    nameError={nameError}
                    device={device}
                />
                <MacInput mac={mac} setMac={setMac} setMacError={setMacError} macError={macError} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()}>Cancel</Button>
                <Button
                    onClick={() => {
                        try {
                            device.addInterface(name, mac);
                            enqueueSnackbar('Interface ' + name + ' added');
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
