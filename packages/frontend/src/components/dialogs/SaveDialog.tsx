import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Input,
    InputAdornment,
    InputLabel,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { saveJson } from '../../hooks/saveJson';
import { useEnqueueError } from '../../hooks/useEnqueueError';
import { NetworkContext } from '../../NetworkContext';

interface SaveDialogProps {
    close: () => void;
    opened: boolean;
}

export const SaveDialog: React.FC<SaveDialogProps> = ({ opened, close }) => {
    const network = useContext(NetworkContext);
    const { t } = useTranslation();

    const { enqueueSnackbar } = useSnackbar();
    const enqueueError = useEnqueueError();

    const [name, setName] = useState<string>('');
    const nameError = name === '';

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    useEffect(() => {
        setName('');
    }, [opened, setName]);

    return (
        <Dialog open={opened} onClose={() => close()} maxWidth='sm' fullWidth={true}>
            <DialogTitle>{t('dialog.save.title')}</DialogTitle>
            <DialogContent>
                <FormControl fullWidth margin='dense' error={nameError} variant='standard'>
                    <InputLabel>{t('dialog.common.filename')}</InputLabel>
                    <Input
                        type='text'
                        value={name}
                        onChange={handleChange}
                        endAdornment={<InputAdornment position='end'>.json</InputAdornment>}
                    />
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()}>{t('dialog.common.cancel')}</Button>
                <Button
                    onClick={() => {
                        try {
                            saveJson(network.save(), name + '.json');
                            enqueueSnackbar(t('dialog.save.success', { name: name + '.json' }));
                        } catch (e: any) {
                            enqueueError(e);
                        }
                        close();
                    }}
                    disabled={nameError}>
                    {t('dialog.common.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
