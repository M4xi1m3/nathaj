import { Button, Divider, ListItemText, Menu, MenuItem } from '@mui/material';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import React from 'react';

type ActionElement =
    | {
          name: string;
          action: () => void;
      }
    | 'separator';

export const ActionMenu: React.FC<{ elements: ActionElement[]; title: string }> = ({ elements, title }) => {
    const popupState = usePopupState({ variant: 'popover' });

    return (
        <>
            <Button sx={{ color: 'white', display: 'block' }} {...bindTrigger(popupState)}>
                {title}
            </Button>
            <Menu MenuListProps={{ dense: true }} {...bindMenu(popupState)}>
                {elements.map((element, key) => {
                    if (element === 'separator') {
                        return <Divider key={key} />;
                    } else {
                        return (
                            <MenuItem
                                key={key}
                                onClick={() => {
                                    element.action();
                                    popupState.close();
                                }}>
                                <ListItemText>{element.name}</ListItemText>
                            </MenuItem>
                        );
                    }
                })}
            </Menu>
        </>
    );
};
