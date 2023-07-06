import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NetworkContext } from '../../NetworkContext';
import { Host } from '../../simulator/network/peripherals/Host';
import { Interface } from '../../simulator/network/peripherals/Interface';
import { InterfaceInput } from '../fields/InterfaceInput';

interface LLCTestDialogProps {
    close: () => void;
    opened: boolean;
    intf: Interface;
}

export const LLCTestDialog: React.FC<LLCTestDialogProps> = ({ opened, close, intf: srcIntf }) => {
    const network = useContext(NetworkContext);
    const { t } = useTranslation();

    const [device, setDevice] = useState<string | null>(null);
    const [intf, setIntf] = useState<string | null>(null);

    useEffect(() => {
        setDevice(null);
        setIntf(null);
    }, [opened, setDevice, setIntf]);

    return (
        <Dialog open={opened} onClose={() => close()} maxWidth='sm' fullWidth={true}>
            <DialogTitle>{t('dialog.llctest.title')}</DialogTitle>
            <DialogContent>
                <InterfaceInput
                    device={device}
                    setDevice={setDevice}
                    intf={intf}
                    setIntf={setIntf}
                    devFilter={(dev) => dev instanceof Host}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()}>{t('dialog.common.cancel')}</Button>
                <Button
                    onClick={() => {
                        const host = srcIntf.getOwner();
                        if (host instanceof Host) {
                            host.sendLLCTest(network.getDevice(device).getInterface(intf).getMac(), srcIntf.getName());
                        }
                        close();
                    }}
                    disabled={device === null || intf === null}>
                    {t('dialog.common.send')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
