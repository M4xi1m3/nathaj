import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEnqueueError } from '../../hooks/useEnqueueError';
import { NetworkContext } from '../../NetworkContext';
import { InterfaceInput } from '../fields/InterfaceInput';

interface AddLinkDialogProps {
    close: () => void;
    opened: boolean;
}

export const AddLinkDialog: React.FC<AddLinkDialogProps> = ({ opened, close }) => {
    const network = useContext(NetworkContext);
    const { t } = useTranslation();

    const { enqueueSnackbar } = useSnackbar();
    const enqueueError = useEnqueueError();

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
            <DialogTitle>{t('dialog.addlink.title')}</DialogTitle>
            <DialogContent>
                <InterfaceInput
                    exclude={[{ device: device2, intf: intf2 }]}
                    device={device1}
                    setDevice={setDevice1}
                    intf={intf1}
                    setIntf={setIntf1}
                    free
                />
                <InterfaceInput
                    exclude={[{ device: device1, intf: intf1 }]}
                    device={device2}
                    setDevice={setDevice2}
                    intf={intf2}
                    setIntf={setIntf2}
                    free
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()}>{t('dialog.common.cancel')}</Button>
                <Button
                    onClick={() => {
                        try {
                            if (device1 !== null && device2 !== null && intf1 !== null && intf2 !== null) {
                                network.addLink(device1, intf1, device2, intf2);
                                enqueueSnackbar(t('dialog.addlink.success'));
                            }
                        } catch (e: any) {
                            enqueueError(e);
                        }
                        close();
                    }}
                    disabled={device1 === null || intf1 === null || device2 === null || intf2 === null}>
                    {t('dialog.common.add')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
