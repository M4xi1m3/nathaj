import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import { NetworkContext } from '../../NetworkContext';
import { Switch } from '../../simulator/network/peripherals/Switch';
import { MacInput } from '../fields/MacInput';
import { NameInput } from '../fields/NameInput';
import { PortsInput } from '../fields/PortsInput';

interface AddSwitchDialogProps {
    close: () => void;
    opened: boolean;
}

export const AddSwitchDialog: React.FC<AddSwitchDialogProps> = ({ opened, close }) => {
    const network = useContext(NetworkContext);

    const { enqueueSnackbar } = useSnackbar();

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);

    const [ports, setPorts] = useState<number>(1);
    const [portsError, setPortsError] = useState<boolean>(false);

    const [mac, setMac] = useState<string>('');
    const [macError, setMacError] = useState<boolean>(false);

    useEffect(() => {
        setName('');
        setPorts(4);
        setMac('');
    }, [opened, setName, setPorts, setMac]);

    return (
        <Dialog open={opened} onClose={() => close()} maxWidth='sm' fullWidth={true}>
            <DialogTitle>Add Switch</DialogTitle>
            <DialogContent>
                <NameInput name={name} setName={setName} setNameError={setNameError} />
                <MacInput mac={mac} setMac={setMac} setMacError={setMacError} />
                <PortsInput ports={ports} setPorts={setPorts} setPortsError={setPortsError} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()}>Cancel</Button>
                <Button
                    onClick={() => {
                        try {
                            new Switch(network, name, mac, ports);
                        } catch (e: any) {
                            enqueueSnackbar((e as Error).message, { variant: 'error' });
                        }
                        close();
                    }}
                    disabled={nameError || portsError || macError}>
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
};
