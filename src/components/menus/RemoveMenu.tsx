import { Button, Divider, ListItemText, Menu, MenuItem } from '@mui/material';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import React from 'react';

type RemoveElement =
    | {
          name: string;
          remove: () => void;
      }
    | 'separator';

export const RemoveMenu: React.FC<{ elements: RemoveElement[] }> = ({ elements }) => {
    const popupState = usePopupState({ variant: 'popover' });

    return (
        <>
            <Button sx={{ color: 'white', display: 'block' }} {...bindTrigger(popupState)}>
                Remove
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
                                    element.remove();
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
