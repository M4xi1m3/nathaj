import { TextField } from '@mui/material';
import React, { useContext } from 'react';
import { NetworkContext } from '../../NetworkContext';

interface NameInputProps {
    name: string;
    setName: (name: string) => void;
    setNameError?: (nameError: boolean) => void;
}

export const NameInput: React.FC<NameInputProps> = ({ name, setName, setNameError }) => {
    const network = useContext(NetworkContext);

    const nameError = name === '' || network.hasDevice(name);

    if (setNameError !== undefined) setNameError(nameError);

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
