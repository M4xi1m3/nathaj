import { useState } from 'react';
import { RemoveDeviceDialog } from '../dialogs/RemoveDeviceDialog';
import { RemoveLinkDialog } from '../dialogs/RemoveLinkDialog';
import { ActionMenu } from './ActionMenu';

export const RemoveMenu: React.FC<{
    selected: string | null;
    setSelected: (name: string | null) => void;
}> = ({ selected, setSelected }) => {
    const [removeDeviceOpened, setRemoveDeviceOpened] = useState<boolean>(false);
    const [removeLinkOpened, setRemoveLinkOpened] = useState<boolean>(false);

    return (
        <>
            <RemoveDeviceDialog
                opened={removeDeviceOpened}
                close={() => setRemoveDeviceOpened(false)}
                selected={selected}
                setSelected={setSelected}
            />
            <RemoveLinkDialog opened={removeLinkOpened} close={() => setRemoveLinkOpened(false)} />

            <ActionMenu
                title='Remove'
                elements={[
                    {
                        name: 'Device',
                        action: () => {
                            setRemoveDeviceOpened(true);
                        },
                    },
                    {
                        name: 'Link',
                        action: () => {
                            setRemoveLinkOpened(true);
                        },
                    },
                ]}
            />
        </>
    );
};
