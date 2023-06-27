import React, { useEffect, useState } from 'react';
import { Vector2D } from '../../simulator/drawing/Vector2D';
import { Device } from '../../simulator/network/peripherals/Device';
import { FloatProperty } from './FloatProperty';

export const PosProperty: React.FC<{
    dev: Device;
}> = ({ dev }) => {
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
                label='X'
                value={dev.getPosition().x}
                setValue={(v) => dev.setPosition(new Vector2D(v, dev.getPosition().y))}
            />
            <FloatProperty
                label='Y'
                value={dev.getPosition().y}
                setValue={(v) => dev.setPosition(new Vector2D(dev.getPosition().x, v))}
            />
        </>
    );
};
