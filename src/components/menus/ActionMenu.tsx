import { Button, Divider, IconButton, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import React from 'react';

type ActionElement =
    | {
          name: string;
          action: () => void;
      }
    | 'separator';

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
