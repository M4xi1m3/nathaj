import { Check } from '@mui/icons-material';
import { Button, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ViewElement {
    name: string;
    view: boolean;
    setView: (view: boolean) => void;
}

export const ViewMenu: React.FC<{ elements: ViewElement[] }> = ({ elements }) => {
    const { t } = useTranslation();
    const popupState = usePopupState({ variant: 'popover' });

    return (
        <>
            <Button sx={{ color: 'white', display: 'block' }} {...bindTrigger(popupState)}>
                {t('menu.view.title')}
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
