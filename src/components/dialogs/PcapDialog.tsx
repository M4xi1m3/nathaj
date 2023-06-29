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
import { saveBin } from '../../hooks/saveBin';
import { NetworkContext } from '../../NetworkContext';
import { AnalyzedPacket } from '../../simulator/network/packets/Packet';
import { PcapngWriter } from '../../simulator/pcapng/PcapngWriter';

interface PcapDialogProps {
    close: () => void;
    opened: boolean;
    packets: AnalyzedPacket[];
}

export const PcapDialog: React.FC<PcapDialogProps> = ({ opened, close, packets }) => {
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
            <DialogTitle>Save packets</DialogTitle>
            <DialogContent>
                <FormControl fullWidth margin='dense' error={nameError} variant='standard'>
                    <InputLabel>File name</InputLabel>
                    <Input
                        type='text'
                        value={name}
                        onChange={handleChange}
                        endAdornment={<InputAdornment position='end'>.pcapng</InputAdornment>}
                    />
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()}>Cancel</Button>
                <Button
                    onClick={() => {
                        try {
                            const data = PcapngWriter.write(network, packets);
                            saveBin(data, name + '.pcapng');
                            enqueueSnackbar('Network saved as ' + name + '.pcapng');
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
