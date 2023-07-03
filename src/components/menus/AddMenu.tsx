import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusNetwork } from '../../icons/PlusNetwork';
import { AddHostDialog } from '../dialogs/AddHostDialog';
import { AddHubDialog } from '../dialogs/AddHubDialog';
import { AddLinkDialog } from '../dialogs/AddLinkDialog';
import { AddStpSwitchDialog } from '../dialogs/AddStpSwitchDialog';
import { AddSwitchDialog } from '../dialogs/AddSwitchDialog';
import { ActionMenu } from './ActionMenu';

export const AddMenu: React.FC<{
    icon?: boolean;
}> = ({ icon }) => {
    const { t } = useTranslation();
    const [addHostOpened, setAddHostOpened] = useState<boolean>(false);
    const [addHubOpened, setAddHubOpened] = useState<boolean>(false);
    const [addSwitchOpened, setAddSwitchOpened] = useState<boolean>(false);
    const [addStpSwitchOpened, setAddStpSwitchOpened] = useState<boolean>(false);
    const [addLinkDialogOpened, setAddLinkDialogOpened] = useState<boolean>(false);

    return (
        <>
            <AddHostDialog opened={addHostOpened} close={() => setAddHostOpened(false)} />
            <AddHubDialog opened={addHubOpened} close={() => setAddHubOpened(false)} />
            <AddSwitchDialog opened={addSwitchOpened} close={() => setAddSwitchOpened(false)} />
            <AddStpSwitchDialog opened={addStpSwitchOpened} close={() => setAddStpSwitchOpened(false)} />
            <AddLinkDialog opened={addLinkDialogOpened} close={() => setAddLinkDialogOpened(false)} />

            <ActionMenu
                icon={icon}
                iconElement={<PlusNetwork />}
                iconTooltip={t('menu.add.tooltip')}
                title={t('menu.add.title')}
                elements={[
                    {
                        name: t('menu.common.host'),
                        action: () => {
                            setAddHostOpened(true);
                        },
                    },
                    {
                        name: t('menu.common.hub'),
                        action: () => {
                            setAddHubOpened(true);
                        },
                    },
                    {
                        name: t('menu.common.switch'),
                        action: () => {
                            setAddSwitchOpened(true);
                        },
                    },
                    {
                        name: t('menu.common.stpswitch'),
                        action: () => {
                            setAddStpSwitchOpened(true);
                        },
                    },
                    'separator',
                    {
                        name: t('menu.common.link'),
                        action: () => {
                            setAddLinkDialogOpened(true);
                        },
                    },
                ]}
            />
        </>
    );
};
