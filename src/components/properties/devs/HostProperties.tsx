import { IconButton, Tooltip } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { LANPending } from '../../../icons/LANPending';
import { Host } from '../../../simulator/network/peripherals/Host';
import { Interface } from '../../../simulator/network/peripherals/Interface';
import { LLCTestDialog } from '../../dialogs/LLCTestDialog';
import { DeviceProperties, InterfaceProperties, Properties } from '../Properties';

const IntfActions: React.FC<{
    intf: Interface;
}> = ({ intf }) => {
    const [llcTestOpened, setLlcTestOpened] = useState(false);
    return (
        <>
            <LLCTestDialog intf={intf} opened={llcTestOpened} close={() => setLlcTestOpened(false)} />
            <Tooltip title='Send LLC TEST'>
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
    const { enqueueSnackbar } = useSnackbar();

    const llcTestSent = () => {
        enqueueSnackbar('LLC TEST Sent', {
            variant: 'info',
        });
    };
    const llcTestRunning = () => {
        enqueueSnackbar('LLC TEST Already running', {
            variant: 'warning',
        });
    };
    const llcTestSuccess = () => {
        enqueueSnackbar('LLC TEST Success', {
            variant: 'success',
        });
    };
    const llcTestTimeout = () => {
        enqueueSnackbar('LLC TEST Timed out', {
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
