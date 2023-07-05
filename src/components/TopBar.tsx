import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import React from 'react';
import { NetworkActions } from './NetworkActions';

import { useTranslation } from 'react-i18next';
import { ReactComponent as Logo } from '../assets/logo/logo.svg';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LightDarkSwitch } from './Theme';

export const TopBar: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const { t } = useTranslation();
    return (
        <AppBar position='static' enableColorOnDark>
            <Toolbar variant='dense'>
                <Logo style={{ display: 'flex', height: '40px', width: '40px', marginRight: '8px' }} />
                <Typography
                    variant='h5'
                    component='div'
                    sx={{
                        mr: 2,
                        mt: '-4px',
                        display: 'flex',
                        fontFamily: 'Righteous',
                    }}>
                    {t('app.name')}
                </Typography>
                <Box sx={{ flexGrow: 1, display: 'flex' }}>{children}</Box>
                <NetworkActions />
                <LightDarkSwitch />
                <LanguageSwitcher />
            </Toolbar>
        </AppBar>
    );
};
