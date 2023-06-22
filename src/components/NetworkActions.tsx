import { Pause, PlayArrow, RestartAlt } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import React, { useContext, useState } from 'react';
import { NetworkContext } from '../NetworkContext';

/**
 * Network actions component
 */
export const NetworkActions: React.FC = () => {
    const network = useContext(NetworkContext);
    const [playing, setPlaying] = useState(false);

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
            <Tooltip title='Restart simulation'>
                <IconButton size='large' onClick={handleReset} color='inherit'>
                    <RestartAlt />
                </IconButton>
            </Tooltip>
            <Tooltip title={playing ? 'Pause simulation' : 'Start simulation'}>
                <IconButton size='large' onClick={handlePlay} color='inherit'>
                    {playing ? <Pause /> : <PlayArrow />}
                </IconButton>
            </Tooltip>
        </div>
    );
};
