import { ToggleOff, ToggleOn } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PortRole, PortState, STPInterface, STPSwitch } from '../../../simulator/network/peripherals/STPSwitch';
import { IntProperty } from '../IntProperty';
import { MACAddressTableProperty } from '../MACAddressTableProperty';
import { DeviceProperties, InterfaceProperties, Properties } from '../Properties';
import { Property } from '../Property';

export const StpSwitchProperties: React.FC<{
    dev: STPSwitch;
}> = ({ dev }) => {
    const { t } = useTranslation();

    return (
        <>
            <Properties>
                <DeviceProperties dev={dev}>
                    <IntProperty
                        label={t('panel.properties.stpswitch.priority')}
                        value={dev.getPriority()}
                        setValue={(v) => (dev as STPSwitch).setPriority(v)}
                        min={0}
                        max={65536}
                    />
                </DeviceProperties>
            </Properties>
            <MACAddressTableProperty dev={dev} />
            <InterfaceProperties
                dev={dev}
                properties={(intf: STPInterface) => (
                    <>
                        <Property
                            label={t('panel.properties.stpswitch.role')}
                            value={t('panel.properties.stpswitch.roles.' + PortRole[intf.role])}
                        />
                        <Property
                            label={t('panel.properties.stpswitch.state')}
                            value={t('panel.properties.stpswitch.states.' + PortState[intf.state])}
                        />
                        <IntProperty
                            label={t('panel.properties.stpswitch.cost')}
                            value={intf.path_cost}
                            setValue={(v) => intf.setCost(v)}
                            min={0}
                        />
                    </>
                )}
                actions={(intf: STPInterface) =>
                    intf.state === PortState.Disabled ? (
                        <Tooltip title={t('panel.properties.stpswitch.action.enable')}>
                            <IconButton onClick={() => intf.enable()}>
                                <ToggleOff color='error' sx={{ fontSize: '16px' }} />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <Tooltip title={t('panel.properties.stpswitch.action.disable')}>
                            <IconButton onClick={() => intf.disable()}>
                                <ToggleOn color='primary' sx={{ fontSize: '16px' }} />
                            </IconButton>
                        </Tooltip>
                    )
                }
            />
        </>
    );
};
