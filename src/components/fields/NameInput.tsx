import { TextField } from '@mui/material';
import React, { useContext } from 'react';
import { NetworkContext } from '../../NetworkContext';

interface NameInputProps {
    name: string;
    setName: (name: string) => void;
    setNameError: (nameError: boolean) => void;
    nameError: boolean;
}

export const NameInput: React.FC<NameInputProps> = ({ name, setName, setNameError, nameError }) => {
    const network = useContext(NetworkContext);

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
                setNameError(event.target.value === '' || network.hasDevice(event.target.value));
            }}
            error={nameError}
        />
    );
};
