import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEnqueueError } from '../../hooks/useEnqueueError';
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
    const { t } = useTranslation();

    const { enqueueSnackbar } = useSnackbar();
    const enqueueError = useEnqueueError();

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);

    const [mac, setMac] = useState<string>('');
    const [macError, setMacError] = useState<boolean>(false);

    const [ports, setPorts] = useState<number>(1);

    useEffect(() => {
        setName(Hub.getNextAvailableName(network));
        setMac(Hub.getNextAvailableMac(network));
        setPorts(4);
    }, [opened, setName, setMac, setPorts]);

    return (
        <Dialog open={opened} onClose={() => close()} maxWidth='sm' fullWidth={true}>
            <DialogTitle>{t('dialog.addhub.title')}</DialogTitle>
            <DialogContent>
                <NameInput name={name} setName={setName} setNameError={setNameError} nameError={nameError} />
                <MacInput mac={mac} setMac={setMac} setMacError={setMacError} macError={macError} />
                <PortsInput ports={ports} setPorts={setPorts} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()}>{t('dialog.common.cancel')}</Button>
                <Button
                    onClick={() => {
                        try {
                            new Hub(network, name, mac, ports);
                            enqueueSnackbar(t('dialog.addhub.title', { name }));
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
