import { Check, Language } from '@mui/icons-material';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { availableLanguages } from '../i18n';

export const LanguageSwitcher: React.FC = () => {
    const { t, i18n } = useTranslation();

    const popupState = usePopupState({
        variant: 'popover',
    });

    return (
        <>
            <Tooltip title={t('action.language')}>
                <IconButton size='large' color='inherit' {...bindTrigger(popupState)}>
                    <Language />
                </IconButton>
            </Tooltip>
            <Menu {...bindMenu(popupState)}>
                {availableLanguages.map((lng, key) => (
                    <MenuItem dense key={key} onClick={() => i18n.changeLanguage(lng)}>
                        {lng === i18n.language ? (
                            <ListItemIcon>
                                <Check />
                            </ListItemIcon>
                        ) : null}
                        <ListItemText inset={lng !== i18n.language}>
                            {t('lang', {
                                lng,
                            })}
                        </ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};
