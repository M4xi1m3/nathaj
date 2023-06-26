import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import { NetworkContext } from '../../NetworkContext';
import { DeviceInput } from '../fields/DeviceInput';

interface RemoveDeviceDialogProps {
    close: () => void;
    opened: boolean;
    selected: string | null;
    setSelected: (name: string | null) => void;
}

export const RemoveDeviceDialog: React.FC<RemoveDeviceDialogProps> = ({ opened, close, selected, setSelected }) => {
    const network = useContext(NetworkContext);

    const { enqueueSnackbar } = useSnackbar();

    const [device, setDevice] = useState<string | null>(null);

    useEffect(() => {
        setDevice(null);
    }, [opened, setDevice]);

    return (
        <Dialog open={opened} onClose={() => close()} maxWidth='sm' fullWidth={true}>
            <DialogTitle>Remove device</DialogTitle>
            <DialogContent>
                <DeviceInput device={device} setDevice={setDevice} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()}>Cancel</Button>
                <Button
                    onClick={() => {
                        try {
                            if (device !== null) {
                                network.removeDevice(device);
                                if (device === selected) setSelected(null);
                                setDevice(null);
                                enqueueSnackbar('Device ' + device + ' removed');
                            }
                        } catch (e: any) {
                            enqueueSnackbar((e as Error).message, { variant: 'error' });
                        }
                        close();
                    }}
                    disabled={device === null}>
                    Remove
                </Button>
            </DialogActions>
        </Dialog>
    );
};
