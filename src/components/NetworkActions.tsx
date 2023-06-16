import { Pause, PlayArrow, RestartAlt } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React, { useContext, useState } from "react";
import { NetworkContext } from "../NetworkContexxt";

export const NetworkActions: React.FC = () => {
    const network = useContext(NetworkContext);
    const [playing, setPlaying] = useState(false);

    const handlePlay = () => {
        if (network.isRunning())
            network.stop();
        else
            network.start();
        setPlaying(network.isRunning());
    }

    const handleReset = () => {
        network.reset();
        setPlaying(network.isRunning());
    }

    return (
        <div>
            <IconButton
                size="large"
                onClick={handleReset}
                color="inherit"
            >
                <RestartAlt />
            </IconButton>
            <IconButton
                size="large"
                onClick={handlePlay}
                color="inherit"
            >
                {playing ? <Pause /> : <PlayArrow />}
            </IconButton>
        </div>
    );
}
