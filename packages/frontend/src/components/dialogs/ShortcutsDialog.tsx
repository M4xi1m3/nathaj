import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ShortcutsDialogProps {
    close: () => void;
    opened: boolean;
}

const Shortcut: React.FC<{
    name: string;
    shortcut: string;
}> = ({ name, shortcut }) => {
    const { t } = useTranslation();

    return (
        <Stack direction='row' sx={{ padding: '2px 0' }}>
            <Typography sx={{ flexGrow: 1 }}>{t(name)}</Typography>
            {shortcut.split(' ').map((val, key) => (
                <Chip label={val.toUpperCase()} key={key} size='small' sx={{ marginLeft: '8px', minWidth: '24px' }} />
            ))}
        </Stack>
    );
};

export const ShortcutsDialog: React.FC<ShortcutsDialogProps> = ({ opened, close }) => {
    const { t } = useTranslation();

    return (
        <Dialog open={opened} onClose={() => close()} maxWidth='sm' fullWidth={true}>
            <DialogTitle>{t('dialog.shortcuts.title')}</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', paddingBottom: 0 }}>
                <Shortcut name='dialog.shortcuts.open' shortcut='ctrl /' />

                <Typography variant='h6'>{t('dialog.shortcuts.files.title')}</Typography>
                <Shortcut name='dialog.shortcuts.files.save' shortcut='ctrl s' />
                <Shortcut name='dialog.shortcuts.files.load' shortcut='ctrl o' />

                <Typography variant='h6'>{t('dialog.shortcuts.simulation.title')}</Typography>
                <Shortcut name='dialog.shortcuts.simulation.play' shortcut={t('dialog.shortcuts.space')} />
                <Shortcut name='dialog.shortcuts.simulation.restart' shortcut='s' />
                <Shortcut name='dialog.shortcuts.simulation.speedup' shortcut='+' />
                <Shortcut name='dialog.shortcuts.simulation.slowdown' shortcut='-' />

                <Typography variant='h6'>{t('dialog.shortcuts.view.title')}</Typography>
                <Shortcut name='dialog.shortcuts.view.network' shortcut='ctrl alt shift n' />
                <Shortcut name='dialog.shortcuts.view.properties' shortcut='ctrl alt shift p' />
                <Shortcut name='dialog.shortcuts.view.legend' shortcut='ctrl alt shift l' />
                <Shortcut name='dialog.shortcuts.view.analyzer' shortcut='ctrl alt shift a' />
                <Shortcut name='dialog.shortcuts.view.console' shortcut='ctrl alt shift c' />
            </DialogContent>
            <DialogActions sx={{ paddingTop: 0 }}>
                <Button onClick={() => close()}>{t('dialog.common.close')}</Button>
            </DialogActions>
        </Dialog>
    );
};
