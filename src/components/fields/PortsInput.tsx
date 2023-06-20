import { TextField } from '@mui/material';
import React from 'react';

interface PortsInputProps {
    ports: number;
    setPorts: (ports: number) => void;
    setPortsError?: (portsError: boolean) => void;
}

export const PortsInput: React.FC<PortsInputProps> = ({ ports, setPorts, setPortsError }) => {
    const portsError = ports < 0;

    if (setPortsError !== undefined) setPortsError(portsError);

    return (
        <TextField
            variant='standard'
            type='number'
            label='Ports'
            fullWidth
            margin='dense'
            value={ports}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setPorts(parseInt(event.target.value));
            }}
            error={portsError}
        />
    );
};
