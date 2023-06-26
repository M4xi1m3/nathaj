import { Delete } from '@mui/icons-material';
import { IconButton, Table, TableBody, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { Switch } from '../../simulator/network/peripherals/Switch';
import { PropAccordion, PropAccordionDetails, PropAccordionSummary } from './PropAccordion';
import { PropCell, PropValue } from './Property';

export const MACAddressTableProperty: React.FC<{ dev: Switch }> = ({ dev }) => {
    return (
        <PropAccordion>
            <PropAccordionSummary>
                <Typography variant='h6' sx={{ padding: '0 8px', flexGrow: 1 }}>
                    MAC Address Table
                </Typography>
                <Tooltip title='Clear'>
                    <IconButton onClick={() => dev.clearMacAddressTable()}>
                        <Delete color='error' sx={{ fontSize: '0.75em' }} />
                    </IconButton>
                </Tooltip>
            </PropAccordionSummary>
            <PropAccordionDetails>
                {Object.values(dev['mac_address_table']).length === 0 ? (
                    <Typography
                        paragraph
                        sx={{
                            fontStyle: 'italic',
                            color: 'text.secondary',
                            textAlign: 'center',
                            margin: 0,
                        }}
                        variant='caption'>
                        Empty
                    </Typography>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <PropCell>MAC</PropCell>
                                <PropCell>Interface</PropCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dev.getMacAddressTable().map(([k, v], key) => (
                                <TableRow key={key}>
                                    <PropValue sx={{ width: '40% !important' }}>{k}</PropValue>
                                    <PropValue>{v}</PropValue>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </PropAccordionDetails>
        </PropAccordion>
    );
};
