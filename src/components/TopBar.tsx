import {
    AppBar,
    Box,
    Button,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    MenuList,
    Paper,
    Toolbar,
    Typography,
} from '@mui/material';
import { NetworkActions } from './NetworkActions';
import React from 'react';
import { usePopupState, bindTrigger, bindMenu } from 'material-ui-popup-state/hooks';
import { Check } from '@mui/icons-material';

interface ViewElement {
    name: string;
    view: boolean;
    setView: (view: boolean) => void;
}

export const ViewMenu: React.FC<{ elements: ViewElement[] }> = ({ elements }) => {
    const popupState = usePopupState({ variant: 'popover' });

    return (
        <>
            <Button sx={{ color: 'white', display: 'block' }} {...bindTrigger(popupState)}>
                View
            </Button>
            <Menu MenuListProps={{ dense: true }} {...bindMenu(popupState)}>
                {elements.map((element, key) => {
                    if (element.view) {
                        return (
                            <MenuItem
                                key={key}
                                onClick={() => {
                                    element.setView(false);
                                }}>
                                <ListItemIcon>
                                    <Check />
                                </ListItemIcon>
                                <ListItemText>{element.name}</ListItemText>
                            </MenuItem>
                        );
                    } else {
                        return (
                            <MenuItem
                                key={key}
                                onClick={() => {
                                    element.setView(true);
                                }}>
                                <ListItemText inset>{element.name}</ListItemText>
                            </MenuItem>
                        );
                    }
                })}
            </Menu>
        </>
    );
};

export const TopBar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <AppBar position='static'>
            <Toolbar variant='dense'>
                <Typography
                    variant='h6'
                    component='div'
                    sx={{
                        mr: 2,
                        display: 'flex',
                        fontWeight: 700,
                    }}>
                    Web-NetSim
                </Typography>
                <Box sx={{ flexGrow: 1, display: 'flex' }}>{children}</Box>
                <NetworkActions />
            </Toolbar>
        </AppBar>
    );
};
