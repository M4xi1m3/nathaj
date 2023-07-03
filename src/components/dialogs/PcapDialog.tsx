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
import { saveBin } from '../../hooks/saveBin';
import { useEnqueueError } from '../../hooks/useEnqueueError';
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
            <DialogTitle>{t('dialog.pcap.title')}</DialogTitle>
            <DialogContent>
                <FormControl fullWidth margin='dense' error={nameError} variant='standard'>
                    <InputLabel>{t('dialog.common.filename')}</InputLabel>
                    <Input
                        type='text'
                        value={name}
                        onChange={handleChange}
                        endAdornment={<InputAdornment position='end'>.pcapng</InputAdornment>}
                    />
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()}>{t('dialog.common.cancel')}</Button>
                <Button
                    onClick={() => {
                        try {
                            const data = PcapngWriter.write(network, packets);
                            saveBin(data, name + '.pcapng');
                            enqueueSnackbar(t('dialog.pcap.success', { name: name + '.pcapng' }));
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
