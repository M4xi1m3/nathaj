import { Device, Vector2D } from '@nathaj/simulator';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FloatProperty } from './FloatProperty';

export const PosProperty: React.FC<{
    dev: Device;
}> = ({ dev }) => {
    const { t } = useTranslation();

    // TODO: Envie de crever
    const [chg, setChg] = useState(0);
    useEffect(() => {
        const handleChanged = () => {
            setChg(chg + 1);
        };

        if (dev !== null) {
            dev.addEventListener('poschanged', handleChanged);
        }

        return () => {
            if (dev !== null) {
                dev.removeEventListener('poschanged', handleChanged);
            }
        };
    }, [dev, setChg, chg]);

    return (
        <>
            <FloatProperty
                label={t('panel.properties.pos.x')}
                value={dev.getPosition().x}
                setValue={(v) => dev.setPosition(new Vector2D(v, dev.getPosition().y))}
            />
            <FloatProperty
                label={t('panel.properties.pos.y')}
                value={dev.getPosition().y}
                setValue={(v) => dev.setPosition(new Vector2D(dev.getPosition().x, v))}
            />
        </>
    );
};
