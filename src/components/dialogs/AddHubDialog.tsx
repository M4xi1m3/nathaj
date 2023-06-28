import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import { NetworkContext } from '../../NetworkContext';
import { Hub } from '../../simulator/network/peripherals/Hub';
import { MacInput } from '../fields/MacInput';
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

    const [mac, setMac] = useState<string>('');
    const [macError, setMacError] = useState<boolean>(false);

    const [ports, setPorts] = useState<number>(1);

    useEffect(() => {
        setName(Hub.getNextAvailableName(network));
        setMac('');
        setPorts(4);
    }, [opened, setName, setMac, setPorts]);

    return (
        <Dialog open={opened} onClose={() => close()} maxWidth='sm' fullWidth={true}>
            <DialogTitle>Add Hub</DialogTitle>
            <DialogContent>
                <NameInput name={name} setName={setName} setNameError={setNameError} nameError={nameError} />
                <MacInput mac={mac} setMac={setMac} setMacError={setMacError} macError={macError} />
                <PortsInput ports={ports} setPorts={setPorts} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()}>Cancel</Button>
                <Button
                    onClick={() => {
                        try {
                            new Hub(network, name, ports, mac);
                            enqueueSnackbar('Hub ' + name + ' added');
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
