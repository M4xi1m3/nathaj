import { Table, TableBody, Typography } from '@mui/material';
import React from 'react';
import { Device } from '../../simulator/network/peripherals/Device';
import { Interface } from '../../simulator/network/peripherals/Interface';
import { Property } from './Property';

export const Properties: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Table>
        <TableBody>{children}</TableBody>
    </Table>
);

export const InterfaceProperties: React.FC<{ dev: Device; properties?: (intf: Interface) => React.ReactNode }> = ({
    dev,
    properties,
}) => (
    <>
        {dev.getInterfaces().map((intf, key) => (
            <React.Fragment key={key}>
                <Typography variant='h6' sx={{ padding: '0 8px' }}>
                    Interface {intf.getName()}
                </Typography>
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
            </React.Fragment>
        ))}
    </>
);
