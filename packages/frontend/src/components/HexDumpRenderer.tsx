import { alpha, Grid, Typography, useTheme } from '@mui/material';
import React from 'react';

function divideInChunks<T>(arr: T[], size: number): T[][] {
    return arr.reduce((resultArray: T[][], item: T, index: number) => {
        const chunkIndex = Math.floor(index / size);

        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []; // start a new chunk
        }

        resultArray[chunkIndex].push(item);

        return resultArray;
    }, []);
}

const numberToPrintableChar = (num: number): string => {
    if (num >= 32 && num < 127) return String.fromCharCode(num);
    return '.';
};

/**
 * Render an hex dump
 */
export const HexDumpRenderer: React.FC<{
    buffer: ArrayBuffer;
    space: number;
    newline: number;
    selection: null | [number, number][];
}> = ({ buffer, space, newline, selection }) => {
    const theme = useTheme();

    const arr: number[] = Array.from(new Uint8Array(buffer).values());

    const data = divideInChunks(arr, newline).map((v: number[]) => divideInChunks(v, space));

    return (
        <Grid container spacing={2}>
            <Grid item>
                {data.map((line, line_no) => (
                    <Typography
                        sx={{
                            fontFamily: 'Roboto Mono',
                            fontSize: '0.75em',
                            whiteSpace: 'pre',
                        }}
                        key={line_no}>
                        {line.map((group, group_no) => (
                            <React.Fragment key={group_no}>
                                {group.map((v, byte_no) => {
                                    const index = line_no * newline + group_no * space + byte_no;

                                    let inside = false;

                                    if (selection !== null) {
                                        for (const [start, end] of selection) {
                                            if (index >= start && index <= end) {
                                                inside = true;
                                                break;
                                            }
                                        }
                                    }

                                    if (inside)
                                        return (
                                            <span
                                                key={byte_no}
                                                style={{ backgroundColor: alpha(theme.palette.primary.main, 0.2) }}>
                                                {v.toString(16).padStart(2, '0')}
                                            </span>
                                        );
                                    else return <span key={byte_no}>{v.toString(16).padStart(2, '0')}</span>;
                                })}
                                <span> </span>
                            </React.Fragment>
                        ))}
                    </Typography>
                ))}
            </Grid>
            <Grid item>
                {data.map((line, line_no) => (
                    <Typography
                        sx={{
                            fontFamily: 'Roboto Mono',
                            fontSize: '0.75em',
                            whiteSpace: 'pre',
                        }}
                        key={line_no}>
                        {line.map((group, group_no) => (
                            <React.Fragment key={group_no}>
                                {group.map((v, byte_no) => {
                                    const index = line_no * newline + group_no * space + byte_no;

                                    let inside = false;

                                    if (selection !== null) {
                                        for (const [start, end] of selection) {
                                            if (index >= start && index <= end) {
                                                inside = true;
                                                break;
                                            }
                                        }
                                    }

                                    if (inside)
                                        return (
                                            <span
                                                key={byte_no}
                                                style={{ backgroundColor: alpha(theme.palette.primary.main, 0.2) }}>
                                                {numberToPrintableChar(v)}
                                            </span>
                                        );
                                    else return <span key={byte_no}>{numberToPrintableChar(v)}</span>;
                                })}
                                <span> </span>
                            </React.Fragment>
                        ))}
                    </Typography>
                ))}
            </Grid>
        </Grid>
    );
};
