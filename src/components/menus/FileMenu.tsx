import { useSnackbar } from 'notistack';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { selectFile } from '../../hooks/selectFile';
import { useEnqueueError } from '../../hooks/useEnqueueError';
import { NetworkContext } from '../../NetworkContext';
import { AboutDialog } from '../dialogs/AboutDialog';
import { SaveDialog } from '../dialogs/SaveDialog';
import { ActionMenu } from './ActionMenu';
import { ExampleSubMenu } from './ExampleSubMenu';

export const FileMenu: React.FC<{
    selected: string | null;
    setSelected: (name: string | null) => void;
    playing: boolean;
    setPlaying: (playing: boolean) => void;
}> = ({ setSelected, setPlaying }) => {
    const { t } = useTranslation();
    const [saveOpened, setSaveOpened] = useState<boolean>(false);
    const [aboutOpened, setAboutOpened] = useState<boolean>(false);

    const net = useContext(NetworkContext);
    const { enqueueSnackbar } = useSnackbar();
    const enqueueError = useEnqueueError();

    const loadString = (data: string) => {
        try {
            net.reset();
            setPlaying(false);
            net.load(JSON.parse(data));
            setSelected(null);
            enqueueSnackbar('Loaded successfully');
        } catch (e: any) {
            enqueueError(e);
        }
    };

    return (
        <>
            <SaveDialog opened={saveOpened} close={() => setSaveOpened(false)} />
            <AboutDialog opened={aboutOpened} close={() => setAboutOpened(false)} />

            <ActionMenu
                title={t('menu.file.title')}
                elements={[
                    {
                        name: t('menu.file.save'),
                        action: () => {
                            setSaveOpened(true);
                        },
                    },
                    {
                        name: t('menu.file.load'),
                        action: () => {
                            selectFile('application/json', false).then((file: File | File[]) => {
                                if (file instanceof File) {
                                    file.arrayBuffer().then((buffer) => {
                                        const dec = new TextDecoder('utf-8');
                                        loadString(dec.decode(buffer));
                                    });
                                }
                            });
                        },
                    },
                    {
                        name: t('menu.file.example.title'),
                        elements: ExampleSubMenu(loadString, t),
                    },
                    {
                        name: t('menu.file.clear'),
                        action: () => {
                            net.clear();
                            setSelected(null);
                        },
                    },
                    'separator',
                    {
                        name: t('menu.file.about'),
                        action: () => {
                            setAboutOpened(true);
                        },
                    },
                ]}
            />
        </>
    );
};
