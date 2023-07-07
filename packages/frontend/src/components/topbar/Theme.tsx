import { ThemeProvider } from '@emotion/react';
import { DarkMode, LightMode } from '@mui/icons-material';
import { createTheme, IconButton, Tooltip, useTheme } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const ColorModeContext = React.createContext<{
    toggleColorMode: () => void;
}>({
    toggleColorMode: () => {
        //
    },
});

export const LightDarkSwitch: React.FC = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const colorMode = React.useContext(ColorModeContext);

    return (
        <Tooltip title={t(theme.palette.mode === 'dark' ? 'action.light' : 'action.dark')}>
            <IconButton size='large' onClick={colorMode.toggleColorMode} color='inherit'>
                {theme.palette.mode === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
        </Tooltip>
    );
};

export const Theme: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const [mode, setMode] = React.useState<'light' | 'dark'>('light');
    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        []
    );

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    primary: {
                        main: '#00b3ff',
                    },
                    mode,
                },
                components: {
                    MuiAppBar: {
                        styleOverrides: {
                            root: {
                                background: '#568397',
                                color: 'white',
                            },
                        },
                    },
                },
            }),
        [mode]
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ColorModeContext.Provider>
    );
};
