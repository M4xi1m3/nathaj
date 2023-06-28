import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import { NetworkContext } from '../../NetworkContext';
import { STPSwitch } from '../../simulator/network/peripherals/STPSwitch';
import { MacInput } from '../fields/MacInput';
import { NameInput } from '../fields/NameInput';
import { PortsInput } from '../fields/PortsInput';

interface AddStpSwitchDialogProps {
    close: () => void;
    opened: boolean;
}

export const AddStpSwitchDialog: React.FC<AddStpSwitchDialogProps> = ({ opened, close }) => {
    const network = useContext(NetworkContext);

    const { enqueueSnackbar } = useSnackbar();

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);

    const [ports, setPorts] = useState<number>(1);

    const [mac, setMac] = useState<string>('');
    const [macError, setMacError] = useState<boolean>(false);

    useEffect(() => {
        setName(STPSwitch.getNextAvailableName(network));
        setPorts(4);
        setMac('');
    }, [opened, setName, setPorts, setMac]);

    return (
        <Dialog open={opened} onClose={() => close()} maxWidth='sm' fullWidth={true}>
            <DialogTitle>Add STP Switch</DialogTitle>
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
                            new STPSwitch(network, name, ports, mac);
                            enqueueSnackbar('STP Switch ' + name + ' added');
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
