import { Close, Done } from '@mui/icons-material';
import {
    FormControl,
    IconButton,
    Input,
    InputAdornment,
    styled,
    TableCell,
    TableCellProps,
    TableRow,
    Tooltip,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

export const PropCell = styled(TableCell)<TableCellProps>(() => ({
    '&.MuiTableCell-root': {
        padding: '0 8px',
        fontSize: '0.75em',
        whiteSpace: 'nowrap',
        width: '40%',
    },
}));

export const PropValue = styled(TableCell)<TableCellProps>(() => ({
    '&.MuiTableCell-root': {
        padding: '0 8px',
        fontFamily: 'Roboto Mono',
        fontSize: '0.75em',
        whiteSpace: 'nowrap',
        width: '60%',
    },
}));

export const Property: React.FC<{
    label: string;
    value: string;
    italic?: boolean;
}> = ({ label, value, italic }) => {
    return (
        <TableRow>
            <PropCell>{label}</PropCell>
            {italic ? <PropCell sx={{ fontStyle: 'italic' }}>{value}</PropCell> : <PropValue>{value}</PropValue>}
        </TableRow>
    );
};

export const EditableProperty: React.FC<{
    label: string;
    value: string;
    setValue: (value: string) => void;
    validator: (value: string) => boolean;
}> = ({ label, value, setValue, validator }) => {
    const [val, setVal] = useState<string>(value);
    const [edited, setEdited] = useState<boolean>(false);

    useEffect(() => {
        setVal(value);
    }, [value, setVal]);

    return (
        <TableRow>
            <PropCell>{label}</PropCell>
            <TableCell
                sx={{
                    padding: 0,
                    paddingLeft: '8px',
                    fontSize: '0.75em',
                }}>
                <FormControl variant='standard' fullWidth>
                    <Input
                        disableUnderline
                        sx={{
                            '& .MuiInput-input': {
                                padding: '0',
                                fontFamily: 'Roboto Mono',
                                fontSize: '0.75em',
                                whiteSpace: 'nowrap',
                                backgroudColor: 'primary',
                            },
                        }}
                        endAdornment={
                            edited ? (
                                <InputAdornment position='end'>
                                    <Tooltip title='Save'>
                                        <span>
                                            <IconButton
                                                edge='end'
                                                disabled={!validator(val)}
                                                onClick={() => {
                                                    setValue(val);
                                                    setEdited(false);
                                                }}>
                                                <Done
                                                    color={validator(val) ? 'primary' : 'disabled'}
                                                    sx={{ fontSize: '0.75em' }}
                                                />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    <Tooltip title='Cancel'>
                                        <IconButton
                                            onClick={() => {
                                                setVal(value);
                                                setEdited(false);
                                            }}>
                                            <Close color='error' sx={{ fontSize: '0.75em' }} />
                                        </IconButton>
                                    </Tooltip>
                                </InputAdornment>
                            ) : null
                        }
                        value={val}
                        onChange={(e) => {
                            setVal(e.target.value);
                            setEdited(true);
                        }}
                    />
                </FormControl>
            </TableCell>
        </TableRow>
    );
};
