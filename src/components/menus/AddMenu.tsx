import { useState } from 'react';
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
                iconTooltip='Add device'
                title='Add'
                elements={[
                    {
                        name: 'Host',
                        action: () => {
                            setAddHostOpened(true);
                        },
                    },
                    {
                        name: 'Hub',
                        action: () => {
                            setAddHubOpened(true);
                        },
                    },
                    {
                        name: 'Switch',
                        action: () => {
                            setAddSwitchOpened(true);
                        },
                    },
                    {
                        name: 'STP Switch',
                        action: () => {
                            setAddStpSwitchOpened(true);
                        },
                    },
                    'separator',
                    {
                        name: 'Link',
                        action: () => {
                            setAddLinkDialogOpened(true);
                        },
                    },
                ]}
            />
        </>
    );
};
