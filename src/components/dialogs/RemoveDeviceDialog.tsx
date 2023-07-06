import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEnqueueError } from '../../hooks/useEnqueueError';
import { NetworkContext } from '../../NetworkContext';
import { DeviceInput } from '../fields/DeviceInput';

interface RemoveDeviceDialogProps {
    close: () => void;
    opened: boolean;
}

export const RemoveDeviceDialog: React.FC<RemoveDeviceDialogProps> = ({ opened, close }) => {
    const network = useContext(NetworkContext);
    const { t } = useTranslation();

    const { enqueueSnackbar } = useSnackbar();
    const enqueueError = useEnqueueError();

    const [device, setDevice] = useState<string | null>(null);

    useEffect(() => {
        setDevice(null);
    }, [opened, setDevice]);

    return (
        <Dialog open={opened} onClose={() => close()} maxWidth='sm' fullWidth={true}>
            <DialogTitle>{t('dialog.removedevice.title')}</DialogTitle>
            <DialogContent>
                <DeviceInput device={device} setDevice={setDevice} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()}>{t('dialog.common.cancel')}</Button>
                <Button
                    onClick={() => {
                        try {
                            if (device !== null) {
                                network.removeDevice(device);
                                setDevice(null);
                                enqueueSnackbar(t('dialog.removedevice.success', { name: device }));
                            }
                        } catch (e: any) {
                            enqueueError(e);
                        }
                        close();
                    }}
                    disabled={device === null}>
                    {t('dialog.common.remove')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
