import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import { NetworkContext } from '../../NetworkContext';
import { Device } from '../../simulator/network/peripherals/Device';
import { InterfaceNameInput } from '../fields/InterfaceNameInput';

interface AddInterfaceDialogProps {
    close: () => void;
    opened: boolean;
    device: Device;
}

export const AddInterfaceDialog: React.FC<AddInterfaceDialogProps> = ({ opened, close, device }) => {
    const network = useContext(NetworkContext);

    const { enqueueSnackbar } = useSnackbar();

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);

    useEffect(() => {
        setName('');
        setNameError(true);
    }, [opened, setName, setNameError]);

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
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()}>Cancel</Button>
                <Button
                    onClick={() => {
                        try {
                            device.addInterface(name);
                            enqueueSnackbar('Interface ' + name + ' added');
                        } catch (e: any) {
                            enqueueSnackbar((e as Error).message, { variant: 'error' });
                        }
                        close();
                    }}
                    disabled={nameError}>
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
};
