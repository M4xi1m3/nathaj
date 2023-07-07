import {
    Avatar,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListSubheader,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import HostImg from '../../assets/host.png';
import HubImg from '../../assets/hub.png';
import InterfaceImg from '../../assets/interface.png';
import LinkImg from '../../assets/link.png';
import STPSwitchImg from '../../assets/stp-switch.png';
import SwitchImg from '../../assets/switch.png';

import RoleBlockingImg from '../../assets/stp/role-blocking.png';
import RoleDesignatedImg from '../../assets/stp/role-designated.png';
import RoleDisabledImg from '../../assets/stp/role-disabled.png';
import RoleRootImg from '../../assets/stp/role-root.png';

import StateBlockingImg from '../../assets/stp/state-blocking.png';
import StateDisabledImg from '../../assets/stp/state-disabled.png';
import StateForwardingImg from '../../assets/stp/state-forwarding.png';
import StateLearningImg from '../../assets/stp/state-learning.png';
import StateListeningImg from '../../assets/stp/state-listening.png';

const Entry: React.FC<{ src: string; children: React.ReactNode; dark?: boolean }> = ({ src, children, dark }) => {
    const theme = useTheme();

    return (
        <ListItem dense>
            <ListItemAvatar sx={{ minWidth: 40 }}>
                <Avatar
                    sx={{
                        width: 32,
                        height: 32,
                        ...(dark && theme.palette.mode === 'dark' ? { filter: 'invert(1)' } : {}),
                    }}
                    variant='square'
                    src={src}
                />
            </ListItemAvatar>
            <ListItemText>{children}</ListItemText>
        </ListItem>
    );
};

export const NetworkLegend: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Grid container direction='column' flexWrap='nowrap' sx={{ height: '100%', width: '100%' }}>
            <Grid item sx={{ width: '100%' }}>
                <Stack sx={{ padding: '0px 8px', height: '32px' }} direction='row'>
                    <Stack direction='row' flexGrow={1}>
                        <Typography component='h2' variant='h6' sx={{ whiteSpace: 'nowrap' }}>
                            {t('panel.legend.title')}
                        </Typography>
                    </Stack>
                </Stack>
                <Divider />
            </Grid>
            <Grid item sx={{ height: '100%', overflowY: 'auto' }}>
                <List dense sx={{ width: '100%', bgcolor: 'transparent' }}>
                    <ListSubheader disableSticky sx={{ bgcolor: 'transparent' }}>
                        {t('panel.legend.devices.title')}
                    </ListSubheader>
                    <Entry dark src={HostImg}>
                        {t('panel.legend.devices.host')}
                    </Entry>
                    <Entry dark src={HubImg}>
                        {t('panel.legend.devices.hub')}
                    </Entry>
                    <Entry dark src={SwitchImg}>
                        {t('panel.legend.devices.switch')}
                    </Entry>
                    <Entry dark src={STPSwitchImg}>
                        {t('panel.legend.devices.stpswitch')}
                    </Entry>
                    <Entry src={InterfaceImg}>{t('panel.legend.devices.interface')}</Entry>
                    <ListSubheader disableSticky sx={{ bgcolor: 'transparent' }}>
                        {t('panel.legend.links.title')}
                    </ListSubheader>
                    <Entry dark src={LinkImg}>
                        {t('panel.legend.links.basic')}
                    </Entry>
                    <ListSubheader disableSticky sx={{ bgcolor: 'transparent' }}>
                        {t('panel.legend.stproles.title')}
                    </ListSubheader>
                    <Entry src={RoleDisabledImg}>{t('panel.legend.stproles.disabled')}</Entry>
                    <Entry src={RoleBlockingImg}>{t('panel.legend.stproles.blocking')}</Entry>
                    <Entry src={RoleRootImg}>{t('panel.legend.stproles.root')}</Entry>
                    <Entry src={RoleDesignatedImg}>{t('panel.legend.stproles.designated')}</Entry>
                    <ListSubheader disableSticky sx={{ bgcolor: 'transparent' }}>
                        {t('panel.legend.stpstates.title')}
                    </ListSubheader>
                    <Entry src={StateDisabledImg}>{t('panel.legend.stpstates.disabled')}</Entry>
                    <Entry src={StateBlockingImg}>{t('panel.legend.stpstates.blocking')}</Entry>
                    <Entry src={StateListeningImg}>{t('panel.legend.stpstates.listening')}</Entry>
                    <Entry src={StateLearningImg}>{t('panel.legend.stpstates.learning')}</Entry>
                    <Entry src={StateForwardingImg}>{t('panel.legend.stpstates.forwarding')}</Entry>
                </List>
            </Grid>
        </Grid>
    );
};
