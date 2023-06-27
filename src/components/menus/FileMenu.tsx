import { useSnackbar } from 'notistack';
import { useContext, useState } from 'react';
import { selectFile } from '../../hooks/selectFile';
import { NetworkContext } from '../../NetworkContext';
import { SaveDialog } from '../dialogs/SaveDialog';
import { ActionMenu } from './ActionMenu';

export const FileMenu: React.FC<{
    selected: string | null;
    setSelected: (name: string | null) => void;
}> = ({ selected, setSelected }) => {
    const [saveOpened, setSaveOpened] = useState<boolean>(false);

    const net = useContext(NetworkContext);
    const { enqueueSnackbar } = useSnackbar();

    return (
        <>
            <SaveDialog opened={saveOpened} close={() => setSaveOpened(false)} />

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
                                        try {
                                            net.load(JSON.parse(dec.decode(buffer)));
                                            setSelected(null);
                                        } catch (e: any) {
                                            enqueueSnackbar((e as Error).message, {
                                                variant: 'error',
                                            });
                                        }
                                    });
                                }
                            });
                        },
                    },
                    {
                        name: 'Clear',
                        action: () => {
                            net.clear();
                        },
                    },
                ]}
            />
        </>
    );
};
