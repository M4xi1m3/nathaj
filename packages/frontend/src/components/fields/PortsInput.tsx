import { TextField } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface PortsInputProps {
    ports: number;
    setPorts: (ports: number) => void;
}

export const PortsInput: React.FC<PortsInputProps> = ({ ports, setPorts }) => {
    const { t } = useTranslation();

    return (
        <TextField
            variant='standard'
            type='number'
            label={t('field.ports.label')}
            fullWidth
            margin='dense'
            value={ports}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setPorts(parseInt(event.target.value) < 0 ? 0 : parseInt(event.target.value));
            }}
        />
    );
};
