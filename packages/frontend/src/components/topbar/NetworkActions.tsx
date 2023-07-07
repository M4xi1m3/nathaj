import { Pause, PlayArrow, RestartAlt } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import useMousetrap from 'react-hook-mousetrap';
import { useTranslation } from 'react-i18next';
import { NetworkContext } from '../../NetworkContext';
import { SpeedControl } from './SpeedControl';

/**
 * Network actions component
 */
export const NetworkActions: React.FC = () => {
    const { t } = useTranslation();

    const network = useContext(NetworkContext);
    const [playing, setPlaying] = useState(false);

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

    useMousetrap('space', (e: KeyboardEvent) => {
        e.preventDefault();
        handlePlay();
    });

    useMousetrap('s', (e: KeyboardEvent) => {
        e.preventDefault();
        handleReset();
    });

    return (
        <div>
            <Tooltip title={t('action.restart')}>
                <IconButton size='large' onClick={handleReset} color='inherit'>
                    <RestartAlt />
                </IconButton>
            </Tooltip>
            <SpeedControl />
            <Tooltip title={t(playing ? 'action.pause' : 'action.play')}>
                <IconButton size='large' onClick={handlePlay} color='inherit'>
                    {playing ? <Pause /> : <PlayArrow />}
                </IconButton>
            </Tooltip>
        </div>
    );
};
