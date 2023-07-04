import React, { useState } from 'react';
import useMousetrap from 'react-hook-mousetrap';
import { useTranslation } from 'react-i18next';
import { AboutDialog } from '../dialogs/AboutDialog';
import { ShortcutsDialog } from '../dialogs/ShortcutsDialog';
import { ActionMenu } from './ActionMenu';

export const HelpMenu: React.FC = () => {
    const { t } = useTranslation();
    const [aboutOpened, setAboutOpened] = useState<boolean>(false);
    const [shortcutsOpened, setShortcutsOpened] = useState<boolean>(false);

    useMousetrap(['ctrl+:', 'ctrl+/'], (e: KeyboardEvent) => {
        e.preventDefault();
        setShortcutsOpened(!shortcutsOpened);
    });

    return (
        <>
            <AboutDialog opened={aboutOpened} close={() => setAboutOpened(false)} />
            <ShortcutsDialog opened={shortcutsOpened} close={() => setShortcutsOpened(false)} />

            <ActionMenu
                title={t('menu.help.title')}
                elements={[
                    {
                        name: t('menu.help.shortcuts'),
                        action: () => {
                            setShortcutsOpened(true);
                        },
                        shortcut: 'Ctrl+/',
                    },
                    {
                        name: t('menu.help.about'),
                        action: () => {
                            setAboutOpened(true);
                        },
                    },
                ]}
            />
        </>
    );
};
