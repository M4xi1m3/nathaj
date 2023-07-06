import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, Typography } from '@mui/material';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ReactComponent as LogoLight } from '../../assets/logo/logo.svg';

import packageJson from '../../../package.json';

interface AboutDialogProps {
    close: () => void;
    opened: boolean;
}

const LogoPart: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '240px',
                justifyContent: 'end',
                textAlign: 'center',
            }}>
            <LogoLight style={{ width: '128px', marginRight: '16px', height: '128px' }} />
            <Typography sx={{ marginBottom: '24px', fontFamily: 'Righteous' }} variant='h5' color='text.secondary'>
                {t('app.namever', { version: packageJson.version })}
            </Typography>
            <Typography gutterBottom variant='body2' sx={{ marginBottom: '24px' }}>
                {t('app.description')}
            </Typography>
        </Box>
    );
};

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

export const AboutDialog: React.FC<AboutDialogProps> = ({ opened, close }) => {
    const { t } = useTranslation();

    return (
        <Dialog open={opened} onClose={() => close()} maxWidth='sm' fullWidth={true}>
            <DialogTitle>{t('dialog.about.title')}</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', paddingBottom: 0 }}>
                <LogoPart />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'end',
                        flexGrow: 1,
                    }}>
                    <Typography gutterBottom variant='caption' sx={{ textAlign: 'center' }}>
                        <CopyrightText />
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ paddingTop: 0 }}>
                <Button onClick={() => close()}>{t('dialog.common.close')}</Button>
            </DialogActions>
        </Dialog>
    );
};
