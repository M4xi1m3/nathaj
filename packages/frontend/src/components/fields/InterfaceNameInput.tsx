import { TextField } from '@mui/material';
import { Device } from '@nathaj/simulator';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface NameInputProps {
    name: string;
    setName: (name: string) => void;
    setNameError: (nameError: boolean) => void;
    nameError: boolean;
    device: Device;
}

export const InterfaceNameInput: React.FC<NameInputProps> = ({ name, setName, setNameError, nameError, device }) => {
    const { t } = useTranslation();
    useEffect(() => {
        setNameError(name === '' || device === null || device.hasInterface(name));
    }, [setNameError, device, name]);

    return (
        <TextField
            variant='standard'
            type='text'
            label={t('field.interfacename.label')}
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
