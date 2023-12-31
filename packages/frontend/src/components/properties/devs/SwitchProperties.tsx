import { Switch } from '@nathaj/simulator';
import React from 'react';
import { MACAddressTableProperty } from '../MACAddressTableProperty';
import { DeviceProperties, InterfaceProperties, Properties } from '../Properties';

export const SwitchProperties: React.FC<{
    dev: Switch;
}> = ({ dev }) => {
    return (
        <>
            <Properties>
                <DeviceProperties dev={dev} />
            </Properties>
            <MACAddressTableProperty dev={dev} />
            <InterfaceProperties dev={dev} />
        </>
    );
};
