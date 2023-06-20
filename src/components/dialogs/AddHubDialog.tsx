import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import { NetworkContext } from '../../NetworkContext';
import { Hub } from '../../simulator/network/peripherals/Hub';
import { NameInput } from '../fields/NameInput';
import { PortsInput } from '../fields/PortsInput';

interface AddHubDialogProps {
    close: () => void;
    opened: boolean;
}

export const AddHubDialog: React.FC<AddHubDialogProps> = ({ opened, close }) => {
    const network = useContext(NetworkContext);

    const { enqueueSnackbar } = useSnackbar();

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);

    const [ports, setPorts] = useState<number>(1);
    const [portsError, setPortsError] = useState<boolean>(false);

    useEffect(() => {
        setName('');
        setPorts(4);
    }, [opened, setName, setPorts]);

    return (
        <Dialog open={opened} onClose={() => close()}>
            <DialogTitle>Add Hub</DialogTitle>
            <DialogContent>
                <NameInput name={name} setName={setName} setNameError={setNameError} />
                <PortsInput ports={ports} setPorts={setPorts} setPortsError={setPortsError} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()}>Cancel</Button>
                <Button
                    onClick={() => {
                        try {
                            new Hub(network, name, ports);
                        } catch (e: any) {
                            enqueueSnackbar((e as Error).message, { variant: 'error' });
                        }
                        close();
                    }}
                    disabled={nameError || portsError}>
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
};
