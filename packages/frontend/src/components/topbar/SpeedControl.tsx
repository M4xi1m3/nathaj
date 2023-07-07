import { FastForward, FastRewind } from '@mui/icons-material';
import { Button, IconButton, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import React, { useContext, useState } from 'react';
import useMousetrap from 'react-hook-mousetrap';
import { useTranslation } from 'react-i18next';
import { NetworkContext } from '../../NetworkContext';

export const SpeedControl: React.FC = () => {
    const speeds = [
        {
            display: '⅛',
            value: 1 / 8,
        },
        {
            display: '¼',
            value: 1 / 4,
        },
        {
            display: '½',
            value: 1 / 2,
        },
        {
            display: '1',
            value: 1,
        },
        {
            display: '2',
            value: 2,
        },
        {
            display: '4',
            value: 4,
        },
        {
            display: '8',
            value: 8,
        },
    ];

    const { t } = useTranslation();
    const network = useContext(NetworkContext);

    const [speed, setSpeed] = useState(Math.floor(speeds.length / 2));

    const handleSlowDown = () => {
        if (speed > 0) {
            setSpeed(speed - 1);
            network.setSpeed(speeds[speed - 1].value);
        }
    };

    const handleSpeedUp = () => {
        if (speed < speeds.length - 1) {
            setSpeed(speed + 1);
            network.setSpeed(speeds[speed + 1].value);
        }
    };

    useMousetrap('+', (e: KeyboardEvent) => {
        e.preventDefault();
        handleSpeedUp();
    });

    useMousetrap('-', (e: KeyboardEvent) => {
        e.preventDefault();
        handleSlowDown();
    });

    const popupState = usePopupState({ variant: 'popover' });

    return (
        <>
            <Tooltip title={t('action.slowdown')}>
                <IconButton size='large' onClick={handleSlowDown} color='inherit' disabled={speed <= 0}>
                    <FastRewind />
                </IconButton>
            </Tooltip>
            <Tooltip title={t('action.speed')} {...bindTrigger(popupState)}>
                <Button sx={{ color: 'white', minWidth: '32px', fontSize: '20px' }}>×{speeds[speed].display}</Button>
            </Tooltip>
            <Menu MenuListProps={{ dense: true }} {...bindMenu(popupState)}>
                {speeds.map((s, key) => (
                    <MenuItem
                        key={key}
                        selected={s.value === speed}
                        onClick={() => {
                            setSpeed(key);
                            popupState.close();
                        }}>
                        <ListItemText>×{s.display}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
            <Tooltip title={t('action.speedup')}>
                <IconButton size='large' onClick={handleSpeedUp} color='inherit' disabled={speed >= speeds.length - 1}>
                    <FastForward />
                </IconButton>
            </Tooltip>
        </>
    );
};
