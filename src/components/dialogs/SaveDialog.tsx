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
import { saveJson } from '../../hooks/saveJson';
import { NetworkContext } from '../../NetworkContext';

interface SaveDialogProps {
    close: () => void;
    opened: boolean;
}

export const SaveDialog: React.FC<SaveDialogProps> = ({ opened, close }) => {
    const network = useContext(NetworkContext);

    const { enqueueSnackbar } = useSnackbar();

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
            <DialogTitle>Save</DialogTitle>
            <DialogContent>
                <FormControl fullWidth margin='dense' error={nameError} variant='standard'>
                    <InputLabel>File name</InputLabel>
                    <Input
                        type='text'
                        value={name}
                        onChange={handleChange}
                        endAdornment={<InputAdornment position='end'>.json</InputAdornment>}
                    />
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()}>Cancel</Button>
                <Button
                    onClick={() => {
                        try {
                            saveJson(network.save(), name + '.json');
                            enqueueSnackbar('Network saved as ' + name + '.json');
                        } catch (e: any) {
                            enqueueSnackbar((e as Error).message, { variant: 'error' });
                        }
                        close();
                    }}
                    disabled={nameError}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};
