import { Button, ListItemText, Menu, MenuItem } from '@mui/material';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import React from 'react';

interface AddElement {
    name: string;
    add: () => void;
}

export const AddMenu: React.FC<{ elements: AddElement[] }> = ({ elements }) => {
    const popupState = usePopupState({ variant: 'popover' });

    return (
        <>
            <Button sx={{ color: 'white', display: 'block' }} {...bindTrigger(popupState)}>
                Add
            </Button>
            <Menu MenuListProps={{ dense: true }} {...bindMenu(popupState)}>
                {elements.map((element, key) => (
                    <MenuItem
                        key={key}
                        onClick={() => {
                            element.add();
                            popupState.close();
                        }}>
                        <ListItemText>{element.name}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};
