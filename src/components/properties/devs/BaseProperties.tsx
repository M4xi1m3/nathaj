import React from 'react';
import { Device } from '../../../simulator/network/peripherals/Device';
import { DeviceProperties, InterfaceProperties, Properties } from '../Properties';

export const BaseProperties: React.FC<{
    dev: Device;
}> = ({ dev }) => {
    return (
        <>
            <Properties>
                <DeviceProperties dev={dev} />
            </Properties>
            <InterfaceProperties dev={dev} />
        </>
    );
};
