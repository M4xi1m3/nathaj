import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RemoveDeviceDialog } from '../dialogs/RemoveDeviceDialog';
import { RemoveLinkDialog } from '../dialogs/RemoveLinkDialog';
import { ActionMenu } from './ActionMenu';

export const RemoveMenu: React.FC<{
    selected: string | null;
    setSelected: (name: string | null) => void;
}> = ({ selected, setSelected }) => {
    const { t } = useTranslation();
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
                title={t('menu.remove.title')}
                elements={[
                    {
                        name: t('menu.common.device'),
                        action: () => {
                            setRemoveDeviceOpened(true);
                        },
                    },
                    {
                        name: t('menu.common.link'),
                        action: () => {
                            setRemoveLinkOpened(true);
                        },
                    },
                ]}
            />
        </>
    );
};
