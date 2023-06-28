import { TextField } from '@mui/material';
import React, { useEffect } from 'react';
import { Device } from '../../simulator/network/peripherals/Device';

interface NameInputProps {
    name: string;
    setName: (name: string) => void;
    setNameError: (nameError: boolean) => void;
    nameError: boolean;
    device: Device;
}

export const InterfaceNameInput: React.FC<NameInputProps> = ({ name, setName, setNameError, nameError, device }) => {
    useEffect(() => {
        setNameError(name === '' || device === null || device.hasInterface(name));
    }, [setNameError, device, name]);

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
            }}
            error={nameError}
        />
    );
};
