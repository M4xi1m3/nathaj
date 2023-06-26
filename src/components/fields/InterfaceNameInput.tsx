import { TextField } from '@mui/material';
import React from 'react';
import { Device } from '../../simulator/network/peripherals/Device';

interface NameInputProps {
    name: string;
    setName: (name: string) => void;
    setNameError: (nameError: boolean) => void;
    nameError: boolean;
    device: Device;
}

export const InterfaceNameInput: React.FC<NameInputProps> = ({ name, setName, setNameError, nameError, device }) => {
    return (
        <TextField
            variant='standard'
            type='text'
            label='Name'
            fullWidth
            margin='dense'
            value={name}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setName(event.target.value);
                setNameError(event.target.value === '' || device.hasInterface(event.target.value));
            }}
            error={nameError}
        />
    );
};
