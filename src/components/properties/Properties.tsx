import { Delete } from '@mui/icons-material';
import { IconButton, Table, TableBody, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../simulator/network/peripherals/Device';
import { MACProperty } from './MACProperty';
import { PosProperty } from './PosProperty';
import { PropAccordion, PropAccordionDetails, PropAccordionSummary } from './PropAccordion';
import { Property } from './Property';

export const Properties: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Table>
        <TableBody>{children}</TableBody>
    </Table>
);

export const DeviceProperties: React.FC<{
    dev: Device;
    children?: React.ReactNode;
}> = ({ dev, children }) => {
    const { t } = useTranslation();

    return (
        <>
            <Property label={t('panel.properties.type')} value={dev.getType()} />
            <Property label={t('panel.properties.name')} value={dev.getName()} />
            {children}
            <PosProperty dev={dev} />
        </>
    );
};

export const InterfaceProperties: React.FC<{
    dev: Device;
    properties?: (intf: any) => React.ReactNode;
    actions?: (intf: any) => React.ReactNode;
}> = ({ dev, properties, actions }) => {
    const { t } = useTranslation();

    return (
        <>
            {dev.getInterfaces().map((intf, key) => (
                <PropAccordion key={key}>
                    <PropAccordionSummary>
                        <Typography variant='h6' sx={{ padding: '0 8px', flexGrow: 1 }}>
                            {t('panel.properties.interface', { name: intf.getName() })}
                        </Typography>
                        {actions === undefined ? null : actions(intf)}
                        <Tooltip title={t('panel.properties.action.delete')}>
                            <IconButton edge='start' onClick={() => intf.getOwner().removeInterface(intf.getName())}>
                                <Delete color='error' sx={{ fontSize: '16px' }} />
                            </IconButton>
                        </Tooltip>
                    </PropAccordionSummary>
                    <PropAccordionDetails>
                        <Table>
                            <TableBody>
                                <Property label={t('panel.properties.name')} value={intf.getFullName()} />
                                <MACProperty intf={intf} />
                                <Property
                                    label={t('panel.properties.connectedto')}
                                    value={intf.getConnection()?.getFullName() ?? t('panel.properties.notconnected')}
                                    italic={!intf.isConnected()}
                                />
                                {properties !== undefined ? properties(intf) : null}
                            </TableBody>
                        </Table>
                    </PropAccordionDetails>
                </PropAccordion>
            ))}
        </>
    );
};
