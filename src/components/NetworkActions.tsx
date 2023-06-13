import { Pause, PlayArrow } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React, { useContext, useState } from "react";
import { NetworkContext } from "../NetworkContexxt";

export const NetworkActions: React.FC = () => {
    const network = useContext(NetworkContext);
    const [playing, setPlaying] = useState(false);

    const handlePlay = () => {
        if (playing)
            network.stop();
        else
            network.start();
        setPlaying(!playing);
    }

    return (
        <div>
            <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handlePlay}
                color="inherit"
            >
                {playing ? <Pause /> : <PlayArrow />}
            </IconButton>
        </div>
    );
}
