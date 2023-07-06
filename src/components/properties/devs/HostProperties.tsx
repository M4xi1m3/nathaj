import { IconButton, Tooltip } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LANPending } from '../../../icons/LANPending';
import { Host } from '../../../simulator/network/peripherals/Host';
import { Interface } from '../../../simulator/network/peripherals/Interface';
import { LLCTestDialog } from '../../dialogs/LLCTestDialog';
import { DeviceProperties, InterfaceProperties, Properties } from '../Properties';

const IntfActions: React.FC<{
    intf: Interface;
}> = ({ intf }) => {
    const { t } = useTranslation();
    const [llcTestOpened, setLlcTestOpened] = useState(false);
    return (
        <>
            <LLCTestDialog intf={intf} opened={llcTestOpened} close={() => setLlcTestOpened(false)} />
            <Tooltip title={t('panel.properties.host.action.llctest')}>
                <IconButton onClick={() => setLlcTestOpened(true)}>
                    <LANPending sx={{ fontSize: '16px' }} />
                </IconButton>
            </Tooltip>
        </>
    );
};

export const HostProperties: React.FC<{
    dev: Host;
}> = ({ dev }) => {
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();

    const llcTestSent = () => {
        enqueueSnackbar(t('panel.properties.host.snack.llcsent'), {
            variant: 'info',
        });
    };
    const llcTestRunning = () => {
        enqueueSnackbar(t('panel.properties.host.snack.llcrunning'), {
            variant: 'warning',
        });
    };
    const llcTestSuccess = () => {
        enqueueSnackbar(t('panel.properties.host.snack.llcsuccess'), {
            variant: 'success',
        });
    };
    const llcTestTimeout = () => {
        enqueueSnackbar(t('panel.properties.host.snack.llctimeout'), {
            variant: 'warning',
        });
    };

    useEffect(() => {
        dev.addEventListener('llc_test_sent', llcTestSent);
        dev.addEventListener('llc_test_running', llcTestRunning);
        dev.addEventListener('llc_test_success', llcTestSuccess);
        dev.addEventListener('llc_test_timeout', llcTestTimeout);

        return () => {
            dev.removeEventListener('llc_test_sent', llcTestSent);
            dev.removeEventListener('llc_test_running', llcTestRunning);
            dev.removeEventListener('llc_test_success', llcTestSuccess);
            dev.removeEventListener('llc_test_timeout', llcTestTimeout);
        };
    }, [dev]);

    return (
        <>
            <Properties>
                <DeviceProperties dev={dev} />
            </Properties>
            <InterfaceProperties dev={dev} actions={(intf: Interface) => <IntfActions intf={intf} />} />
        </>
    );
};
