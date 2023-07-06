import { NavigateNext } from '@mui/icons-material';
import {
    Avatar,
    Button,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import { bindMenu, bindTrigger, PopupState, usePopupState } from 'material-ui-popup-state/hooks';
import React from 'react';

export type ActionElement =
    | {
          name: string;
          action?: () => void;
          elements?: ActionElement[];
          shortcut?: string;
          icon?: string;
          dark?: boolean;
      }
    | 'separator';

const ActionSubMenu: React.FC<{
    name: string;
    elements: ActionElement[];
    rootPopupState: PopupState;
    parentPopupState: PopupState;
}> = ({ name, elements, rootPopupState, parentPopupState }) => {
    const popupState = usePopupState({ parentPopupState, variant: 'popover' });

    return (
        <>
            <MenuItem {...bindTrigger(popupState)}>
                <ListItemText>{name}</ListItemText>
                <ListItemIcon sx={{ display: 'flex', justifyContent: 'end', marginRight: '-12px' }}>
                    <NavigateNext />
                </ListItemIcon>
            </MenuItem>
            <Menu
                MenuListProps={{ dense: true }}
                {...bindMenu(popupState)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}>
                {elements.map((element, key) => (
                    <MenuElement element={element} key={key} popupState={popupState} rootPopupState={rootPopupState} />
                ))}
            </Menu>
        </>
    );
};

const MenuElement: React.FC<{
    element: ActionElement;
    popupState: PopupState;
    rootPopupState: PopupState;
}> = ({ element, popupState, rootPopupState }) => {
    const theme = useTheme();

    if (element === 'separator') {
        return <Divider />;
    } else if (element.elements !== undefined) {
        return (
            <ActionSubMenu
                name={element.name}
                elements={element.elements}
                parentPopupState={popupState}
                rootPopupState={rootPopupState}
            />
        );
    } else {
        return (
            <MenuItem
                onClick={() => {
                    if (element.action !== undefined) {
                        element.action();
                        rootPopupState.close();
                    }
                }}>
                {element.icon !== undefined ? (
                    <Avatar
                        sx={{
                            width: 24,
                            height: 24,
                            marginRight: '6px',
                            ...(!!element.dark && theme.palette.mode === 'dark' ? { filter: 'invert(1)' } : {}),
                        }}
                        variant='square'
                        src={element.icon}
                    />
                ) : null}
                <ListItemText>{element.name}</ListItemText>
                {element.shortcut !== undefined ? (
                    <Typography variant='body2' color='text.secondary' sx={{ paddingLeft: '8px' }}>
                        {element.shortcut}
                    </Typography>
                ) : null}
            </MenuItem>
        );
    }
};

export const ActionMenu: React.FC<{
    elements: ActionElement[];
    title: string;
    icon?: boolean;
    iconElement?: React.ReactNode;
    iconTooltip?: string;
}> = ({ elements, title, icon, iconElement, iconTooltip }) => {
    const popupState = usePopupState({ variant: 'popover' });

    return (
        <>
            {icon && iconElement !== undefined && iconTooltip !== undefined ? (
                <Tooltip title={iconTooltip}>
                    <IconButton size='small' {...bindTrigger(popupState)}>
                        {iconElement}
                    </IconButton>
                </Tooltip>
            ) : (
                <Button sx={{ color: 'white', display: 'block' }} {...bindTrigger(popupState)}>
                    {title}
                </Button>
            )}
            <Menu MenuListProps={{ dense: true }} {...bindMenu(popupState)}>
                {elements.map((element, key) => (
                    <MenuElement element={element} key={key} popupState={popupState} rootPopupState={popupState} />
                ))}
            </Menu>
        </>
    );
};
