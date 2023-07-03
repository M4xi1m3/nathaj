import { Box, Link, Stack, Typography } from '@mui/material';
import React from 'react';

import { ReactComponent as LogoLight } from '../../assets/logo/light.svg';

import { Trans, useTranslation } from 'react-i18next';
import packageJson from '../../../package.json';

export const NoPanels: React.FC = () => {
    const { t } = useTranslation();
    return (
        <Stack sx={{ height: '100%', width: '100%' }} justifyContent='center' alignItems='center'>
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    flexGrow: 1,
                }}>
                <LogoLight style={{ width: '200px', height: '200px', filter: 'grayscale(100%) opacity(50%)' }} />
                <Typography sx={{ fontFamily: 'Righteous', filter: 'opacity(40%)' }} variant='h3'>
                    {t('app.name')}
                </Typography>
                <Typography sx={{ fontFamily: 'Righteous', filter: 'opacity(40%)' }} variant='h5'>
                    {t('app.version', { version: packageJson.version })}
                </Typography>
            </Box>
            <Box sx={{ width: '100%', textAlign: 'center', paddingBottom: '16px' }}>
                <Typography gutterBottom variant='caption' sx={{ textAlign: 'center', filter: 'opacity(60%)' }}>
                    {t('dialog.about.copyright')}
                    {' 2023 ' + packageJson.author.name}
                    {packageJson.contributors.length > 0 ? ' et al.' : ''}
                    <br />
                    <Trans
                        t={t}
                        i18nKey='dialog.about.notice'
                        components={{
                            license: <Link href='/COPYING' />,
                            repo: <Link href={packageJson.repository.url} />,
                        }}
                    />
                </Typography>
            </Box>
        </Stack>
    );
};
