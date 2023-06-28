import { TextField } from '@mui/material';
import React, { useContext, useEffect } from 'react';
import { NetworkContext } from '../../NetworkContext';

interface NameInputProps {
    name: string;
    setName: (name: string) => void;
    setNameError: (nameError: boolean) => void;
    nameError: boolean;
}

export const NameInput: React.FC<NameInputProps> = ({ name, setName, setNameError, nameError }) => {
    const network = useContext(NetworkContext);

    useEffect(() => {
        setNameError(name === '' || network.hasDevice(name));
    }, [setNameError, name, network]);

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
