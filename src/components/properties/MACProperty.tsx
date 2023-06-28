import React from 'react';
import { Interface } from '../../simulator/network/peripherals/Interface';
import { EditableProperty } from './Property';

const macRegexp = new RegExp('^(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$');

export const MACProperty: React.FC<{ intf: Interface }> = ({ intf }) => {
    return (
        <EditableProperty
            label='MAC address'
            value={intf.getMac()}
            setValue={(v) => intf.setMac(v)}
            validator={(value) => {
                if (macRegexp.test(value)) return (parseInt(value.split(':')[0], 16) & 1) === 0;
                return false;
            }}
        />
    );
};
