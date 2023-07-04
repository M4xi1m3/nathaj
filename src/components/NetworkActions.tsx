import { Pause, PlayArrow, RestartAlt } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { NetworkContext } from '../NetworkContext';

/**
 * Network actions component
 */
export const NetworkActions: React.FC<{
    playing: boolean;
    setPlaying: (playing: boolean) => void;
}> = ({ playing, setPlaying }) => {
    const { t } = useTranslation();
    const network = useContext(NetworkContext);

    const handlePlay = () => {
        if (network.isRunning()) network.stop();
        else network.start();
        setPlaying(network.isRunning());
    };

    const handleReset = () => {
        network.reset();
        setPlaying(network.isRunning());
    };

    return (
        <div>
            <Tooltip title={t('action.restart')}>
                <IconButton size='large' onClick={handleReset} color='inherit'>
                    <RestartAlt />
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
