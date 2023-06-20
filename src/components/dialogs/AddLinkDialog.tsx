import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import { NetworkContext } from '../../NetworkContext';
import { InterfaceInput } from '../fields/InterfaceInput';

interface AddLinkDialogProps {
    close: () => void;
    opened: boolean;
}

export const AddLinkDialog: React.FC<AddLinkDialogProps> = ({ opened, close }) => {
    const network = useContext(NetworkContext);

    const { enqueueSnackbar } = useSnackbar();

    const [device1, setDevice1] = useState<string | null>(null);
    const [intf1, setIntf1] = useState<string | null>(null);

    const [device2, setDevice2] = useState<string | null>(null);
    const [intf2, setIntf2] = useState<string | null>(null);

    useEffect(() => {
        setDevice1(null);
        setIntf1(null);
        setDevice2(null);
        setIntf2(null);
    }, [opened, setDevice1, setIntf1, setDevice2, setIntf2]);

    return (
        <Dialog open={opened} onClose={() => close()} maxWidth='sm' fullWidth={true}>
            <DialogTitle>Add Link</DialogTitle>
            <DialogContent>
                <InterfaceInput
                    exclude={[{ device: device2, intf: intf2 }]}
                    device={device1}
                    setDevice={setDevice1}
                    intf={intf1}
                    setIntf={setIntf1}
                />
                <InterfaceInput
                    exclude={[{ device: device1, intf: intf1 }]}
                    device={device2}
                    setDevice={setDevice2}
                    intf={intf2}
                    setIntf={setIntf2}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()}>Cancel</Button>
                <Button
                    onClick={() => {
                        try {
                            if (device1 !== null && device2 !== null && intf1 !== null && intf2 !== null) {
                                network.addLink(device1, intf1, device2, intf2);
                                enqueueSnackbar('Link added');
                            }
                        } catch (e: any) {
                            enqueueSnackbar((e as Error).message, { variant: 'error' });
                        }
                        close();
                    }}
                    disabled={device1 === null || intf1 === null || device2 === null || intf2 === null}>
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
};
