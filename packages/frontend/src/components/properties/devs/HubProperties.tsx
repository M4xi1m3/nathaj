import { Device } from '@nathaj/simulator';
import React from 'react';
import { DeviceProperties, InterfaceProperties, Properties } from '../Properties';

export const HubProperties: React.FC<{
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
