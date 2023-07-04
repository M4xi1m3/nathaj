import {
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Link,
    Stack,
    Typography,
} from '@mui/material';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import packageJson from '../../../package.json';

interface ShortcutsDialogProps {
    close: () => void;
    opened: boolean;
}

export const CopyrightText: React.FC = () => {
    const { t } = useTranslation();
    return (
        <>
            {t('dialog.about.copyright')}
            {' 2023 ' + packageJson.author.name}
            {packageJson.contributors.length > 0 ? ' et al.' : ''}
            <br />
            <Trans
                t={t}
                i18nKey='dialog.about.notice'
                components={{
                    license: <Link href='COPYING' />,
                    repo: <Link href={packageJson.repository.url} />,
                }}
            />
        </>
    );
};

const Shortcut: React.FC<{
    name: string;
    shortcut: string;
}> = ({ name, shortcut }) => {
    const { t } = useTranslation();

    return (
        <Stack direction='row' sx={{ padding: '2px 0' }}>
            <Typography sx={{ flexGrow: 1 }}>{t(name)}</Typography>
            {shortcut.split('+').map((val, key) => (
                <Chip label={val.toUpperCase()} key={key} size='small' sx={{ marginLeft: '8px' }} />
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
                <Shortcut name='dialog.shortcuts.open' shortcut='ctrl+/' />

                <Typography variant='h6'>{t('dialog.shortcuts.files.title')}</Typography>
                <Shortcut name='dialog.shortcuts.files.save' shortcut='ctrl+s' />
                <Shortcut name='dialog.shortcuts.files.load' shortcut='ctrl+o' />

                <Typography variant='h6'>{t('dialog.shortcuts.simulation.title')}</Typography>
                <Shortcut name='dialog.shortcuts.simulation.play' shortcut={t('dialog.shortcuts.space')} />
                <Shortcut name='dialog.shortcuts.simulation.restart' shortcut='s' />

                <Typography variant='h6'>{t('dialog.shortcuts.view.title')}</Typography>
                <Shortcut name='dialog.shortcuts.view.network' shortcut='ctrl+alt+shift+n' />
                <Shortcut name='dialog.shortcuts.view.properties' shortcut='ctrl+alt+shift+p' />
                <Shortcut name='dialog.shortcuts.view.analyzer' shortcut='ctrl+alt+shift+a' />
            </DialogContent>
            <DialogActions sx={{ paddingTop: 0 }}>
                <Button onClick={() => close()}>{t('dialog.common.close')}</Button>
            </DialogActions>
        </Dialog>
    );
};
