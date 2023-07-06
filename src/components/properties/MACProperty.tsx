import React from 'react';
import { useTranslation } from 'react-i18next';
import { Interface } from '../../simulator/network/peripherals/Interface';
import { EditableProperty } from './Property';

const macRegexp = new RegExp('^(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$');

export const MACProperty: React.FC<{ intf: Interface }> = ({ intf }) => {
    const { t } = useTranslation();

    return (
        <EditableProperty
            label={t('panel.properties.mac.title')}
            value={intf.getMac()}
            setValue={(v) => intf.setMac(v)}
            validator={(value) => {
                if (macRegexp.test(value)) return (parseInt(value.split(':')[0], 16) & 1) === 0;
                return false;
            }}
        />
    );
};
