import { TextField } from '@mui/material';
import React from 'react';

interface PortsInputProps {
    ports: number;
    setPorts: (ports: number) => void;
}

export const PortsInput: React.FC<PortsInputProps> = ({ ports, setPorts }) => {
    return (
        <TextField
            variant='standard'
            type='number'
            label='Ports'
            fullWidth
            margin='dense'
            value={ports}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setPorts(parseInt(event.target.value) < 0 ? 0 : parseInt(event.target.value));
            }}
        />
    );
};
