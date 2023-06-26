import { Table, TableBody, Typography } from '@mui/material';
import React from 'react';
import { Device } from '../../simulator/network/peripherals/Device';
import { PropAccordion, PropAccordionDetails, PropAccordionSummary } from './PropAccordion';
import { Property } from './Property';

export const Properties: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Table>
        <TableBody>{children}</TableBody>
    </Table>
);

export const InterfaceProperties: React.FC<{
    dev: Device;
    properties?: (intf: any) => React.ReactNode;
    actions?: (intf: any) => React.ReactNode;
}> = ({ dev, properties, actions }) => (
    <>
        {dev.getInterfaces().map((intf, key) => (
            <PropAccordion key={key}>
                <PropAccordionSummary>
                    <Typography variant='h6' sx={{ padding: '0 8px', flexGrow: 1 }}>
                        Interface {intf.getName()}
                    </Typography>
                    {actions === undefined ? null : actions(intf)}
                </PropAccordionSummary>
                <PropAccordionDetails>
                    <Table>
                        <TableBody>
                            <Property label='Name' value={intf.getFullName()} />
                            <Property
                                label='Connected to'
                                value={intf.getConnection()?.getFullName() ?? 'Not connected'}
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
