import { useSnackbar } from 'notistack';
import React, { useContext, useState } from 'react';
import { selectFile } from '../../hooks/selectFile';
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
    const [saveOpened, setSaveOpened] = useState<boolean>(false);
    const [aboutOpened, setAboutOpened] = useState<boolean>(false);

    const net = useContext(NetworkContext);
    const { enqueueSnackbar } = useSnackbar();

    const loadString = (data: string) => {
        try {
            net.reset();
            setPlaying(false);
            net.load(JSON.parse(data));
            setSelected(null);
            enqueueSnackbar('Loaded successfully');
        } catch (e: any) {
            enqueueSnackbar((e as Error).message, {
                variant: 'error',
            });
        }
    };

    return (
        <>
            <SaveDialog opened={saveOpened} close={() => setSaveOpened(false)} />
            <AboutDialog opened={aboutOpened} close={() => setAboutOpened(false)} />

            <ActionMenu
                title='File'
                elements={[
                    {
                        name: 'Save',
                        action: () => {
                            setSaveOpened(true);
                        },
                    },
                    {
                        name: 'Load',
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
                        name: 'Load example',
                        elements: ExampleSubMenu(loadString),
                    },
                    {
                        name: 'Clear',
                        action: () => {
                            net.clear();
                            setSelected(null);
                        },
                    },
                    'separator',
                    {
                        name: 'About',
                        action: () => {
                            setAboutOpened(true);
                        },
                    },
                ]}
            />
        </>
    );
};
