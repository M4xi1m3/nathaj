import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Device } from '@nathaj/simulator';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEnqueueError } from '../../hooks/useEnqueueError';
import { InterfaceNameInput } from '../fields/InterfaceNameInput';
import { MacInput } from '../fields/MacInput';

interface AddInterfaceDialogProps {
    close: () => void;
    opened: boolean;
    device: Device;
}

export const AddInterfaceDialog: React.FC<AddInterfaceDialogProps> = ({ opened, close, device }) => {
    const { enqueueSnackbar } = useSnackbar();
    const enqueueError = useEnqueueError();

    const { t } = useTranslation();

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);

    const [mac, setMac] = useState<string>('');
    const [macError, setMacError] = useState<boolean>(false);

    useEffect(() => {
        setName(device === null ? '' : device.generateNextIntfName());
        setNameError(true);
        setMac(device === null ? '' : device.generateNextMacAddress());
    }, [opened, setName, setNameError, setMac, setMacError, device]);

    return (
        <Dialog open={opened} onClose={() => close()} maxWidth='sm' fullWidth={true}>
            <DialogTitle>{t('dialog.addinterface.title')}</DialogTitle>
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
                <Button onClick={() => close()}>{t('dialog.common.cancel')}</Button>
                <Button
                    onClick={() => {
                        try {
                            device.addInterface(name, mac);
                            enqueueSnackbar(t('dialog.addinterface.success', { name }));
                        } catch (e: any) {
                            enqueueError(e);
                        }
                        close();
                    }}
                    disabled={nameError || macError}>
                    {t('dialog.common.add')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
