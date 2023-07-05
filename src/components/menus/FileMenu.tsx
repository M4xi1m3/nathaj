import { useSnackbar } from 'notistack';
import React, { useContext, useState } from 'react';
import useMousetrap from 'react-hook-mousetrap';
import { useTranslation } from 'react-i18next';
import { selectFile } from '../../hooks/selectFile';
import { useEnqueueError } from '../../hooks/useEnqueueError';
import { NetworkContext } from '../../NetworkContext';
import { SaveDialog } from '../dialogs/SaveDialog';
import { ActionMenu } from './ActionMenu';
import { ExampleSubMenu } from './ExampleSubMenu';

export const FileMenu: React.FC<{
    selected: string | null;
    setSelected: (name: string | null) => void;
}> = ({ setSelected }) => {
    const { t } = useTranslation();
    const [saveOpened, setSaveOpened] = useState<boolean>(false);

    const net = useContext(NetworkContext);
    const { enqueueSnackbar } = useSnackbar();
    const enqueueError = useEnqueueError();

    const loadString = (data: string) => {
        try {
            net.reset();
            net.load(JSON.parse(data));
            setSelected(null);
            enqueueSnackbar(t('menu.file.loaded'));
        } catch (e: any) {
            enqueueError(e);
        }
    };

    const loadFile = () => {
        selectFile('application/json', false).then((file: File | File[]) => {
            if (file instanceof File) {
                file.arrayBuffer().then((buffer) => {
                    const dec = new TextDecoder('utf-8');
                    loadString(dec.decode(buffer));
                });
            }
        });
    };

    const clear = () => {
        net.clear();
        setSelected(null);
    };

    useMousetrap('ctrl+s', (e: KeyboardEvent) => {
        e.preventDefault();
        setSaveOpened(true);
    });

    useMousetrap('ctrl+o', (e: KeyboardEvent) => {
        e.preventDefault();
        loadFile();
    });

    useMousetrap('ctrl+shift+d', (e: KeyboardEvent) => {
        e.preventDefault();
        clear();
    });

    return (
        <>
            <SaveDialog opened={saveOpened} close={() => setSaveOpened(false)} />

            <ActionMenu
                title={t('menu.file.title')}
                elements={[
                    {
                        name: t('menu.file.save'),
                        action: () => {
                            setSaveOpened(true);
                        },
                        shortcut: 'Ctrl+S',
                    },
                    {
                        name: t('menu.file.load'),
                        action: loadFile,
                        shortcut: 'Ctrl+O',
                    },
                    {
                        name: t('menu.file.example.title'),
                        elements: ExampleSubMenu(loadString, t),
                    },
                    {
                        name: t('menu.file.clear'),
                        action: clear,
                    },
                ]}
            />
        </>
    );
};
