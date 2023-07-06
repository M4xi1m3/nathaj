import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEnqueueError } from '../../hooks/useEnqueueError';
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
    const { t } = useTranslation();

    const { enqueueSnackbar } = useSnackbar();
    const enqueueError = useEnqueueError();

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);

    const [ports, setPorts] = useState<number>(1);

    const [mac, setMac] = useState<string>('');
    const [macError, setMacError] = useState<boolean>(false);

    useEffect(() => {
        setName(Switch.getNextAvailableName(network));
        setMac(Switch.getNextAvailableMac(network));
        setPorts(4);
    }, [opened, setName, setPorts, setMac]);

    return (
        <Dialog open={opened} onClose={() => close()} maxWidth='sm' fullWidth={true}>
            <DialogTitle>{t('dialog.addswitch.title')}</DialogTitle>
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
                            new Switch(network, name, ports, mac);
                            enqueueSnackbar(t('dialog.addswitch.success', { name }));
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
