import React from 'react';
import { MACable } from '../../simulator/network/mixins/MACable';
import { EditableProperty } from './Property';

const macRegexp = new RegExp('^(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$');

export const MACProperty: React.FC<{ dev: MACable }> = ({ dev }) => {
    return (
        <EditableProperty
            label='MAC address'
            value={dev.getMac()}
            setValue={(v) => dev.setMac(v)}
            validator={(value) => {
                if (macRegexp.test(value)) return (parseInt(value.split(':')[0], 16) & 1) === 0;
                return false;
            }}
        />
    );
};
