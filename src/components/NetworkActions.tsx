import { FastForward, FastRewind, Pause, PlayArrow, RestartAlt } from '@mui/icons-material';
import { Button, IconButton, Tooltip } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import useMousetrap from 'react-hook-mousetrap';
import { useTranslation } from 'react-i18next';
import { NetworkContext } from '../NetworkContext';

/**
 * Network actions component
 */
export const NetworkActions: React.FC = () => {
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
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(Math.floor(speeds.length / 2));

    const handleChanged = () => {
        setPlaying(network.isRunning());
    };

    useEffect(() => {
        network.addEventListener('changed', handleChanged);
        return () => {
            network.removeEventListener('changed', handleChanged);
        };
    }, [network]);

    const handlePlay = () => {
        if (network.isRunning()) network.stop();
        else network.start();
    };

    const handleReset = () => {
        network.reset();
    };

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

    useMousetrap('space', (e: KeyboardEvent) => {
        e.preventDefault();
        handlePlay();
    });

    useMousetrap('s', (e: KeyboardEvent) => {
        e.preventDefault();
        handleReset();
    });

    useMousetrap('+', (e: KeyboardEvent) => {
        e.preventDefault();
        handleSpeedUp();
    });

    useMousetrap('-', (e: KeyboardEvent) => {
        e.preventDefault();
        handleSlowDown();
    });

    return (
        <div>
            <Tooltip title={t('action.restart')}>
                <IconButton size='large' onClick={handleReset} color='inherit'>
                    <RestartAlt />
                </IconButton>
            </Tooltip>
            <Tooltip title={t('action.slowdown')}>
                <IconButton size='large' onClick={handleSlowDown} color='inherit' disabled={speed <= 0}>
                    <FastRewind />
                </IconButton>
            </Tooltip>
            <Tooltip title={t('action.speed')}>
                <Button sx={{ color: 'white', minWidth: '32px', fontSize: '20px' }}>×{speeds[speed].display}</Button>
            </Tooltip>
            <Tooltip title={t('action.speedup')}>
                <IconButton size='large' onClick={handleSpeedUp} color='inherit' disabled={speed >= speeds.length - 1}>
                    <FastForward />
                </IconButton>
            </Tooltip>
            <Tooltip title={t(playing ? 'action.pause' : 'action.play')}>
                <IconButton size='large' onClick={handlePlay} color='inherit'>
                    {playing ? <Pause /> : <PlayArrow />}
                </IconButton>
            </Tooltip>
        </div>
    );
};
