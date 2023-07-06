import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEnqueueError } from '../../hooks/useEnqueueError';
import { NetworkContext } from '../../NetworkContext';
import { Host } from '../../simulator/network/peripherals/Host';
import { MacInput } from '../fields/MacInput';
import { NameInput } from '../fields/NameInput';

interface AddHostDialogProps {
    close: () => void;
    opened: boolean;
}

export const AddHostDialog: React.FC<AddHostDialogProps> = ({ opened, close }) => {
    const network = useContext(NetworkContext);
    const { t } = useTranslation();

    const { enqueueSnackbar } = useSnackbar();
    const enqueueError = useEnqueueError();

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);

    const [mac, setMac] = useState<string>('');
    const [macError, setMacError] = useState<boolean>(false);

    useEffect(() => {
        setName(Host.getNextAvailableName(network));
        setMac(Host.getNextAvailableMac(network));
    }, [opened, setName, setMac]);

    return (
        <Dialog open={opened} onClose={() => close()} maxWidth='sm' fullWidth={true}>
            <DialogTitle>{t('dialog.addhost.title')}</DialogTitle>
            <DialogContent>
                <NameInput name={name} setName={setName} setNameError={setNameError} nameError={nameError} />
                <MacInput mac={mac} setMac={setMac} setMacError={setMacError} macError={macError} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()}>{t('dialog.common.cancel')}</Button>
                <Button
                    onClick={() => {
                        try {
                            new Host(network, name, mac);
                            enqueueSnackbar(t('dialog.addhost.success', { name }));
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
