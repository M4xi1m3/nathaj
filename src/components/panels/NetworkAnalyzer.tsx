import {
    ArrowDownward,
    CallMade,
    CallReceived,
    ChevronRight,
    Clear,
    Delete,
    ExpandMore,
    FilterList,
} from '@mui/icons-material';
import TreeView from '@mui/lab/TreeView';
import {
    alpha,
    Divider,
    Fab,
    FormControl,
    Grid,
    IconButton,
    Input,
    InputAdornment,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';
import { compileExpression } from 'filtrex';
import React, { SyntheticEvent, useContext, useEffect, useRef, useState } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { ItemProps, TableComponents, TableVirtuoso, TableVirtuosoHandle } from 'react-virtuoso';
import { NetworkContext } from '../../NetworkContext';
import { PacketEventData } from '../../simulator/network/Network';
import { Ethernet } from '../../simulator/network/packets/definitions/Ethernet';
import { AnalysisItem, AnalysisTree, AnalyzedPacket } from '../../simulator/network/packets/Packet';
import { HorizontalDivider } from '../Dividers';
import { CustomTreeItem } from '../IconExpansionTreeView';

interface RowContext {
    selected: null | number;
    setSelected: (id: number) => void;
}

const CustomScroller = React.forwardRef<HTMLDivElement>((props, ref) => <TableContainer {...props} ref={ref} />);
CustomScroller.displayName = 'CustomScroller';

const CustomTableBody = React.forwardRef<HTMLTableSectionElement>((props, ref) => <TableBody {...props} ref={ref} />);
CustomTableBody.displayName = 'CustomTableBody';

const CustomTableRow: React.FC<
    ItemProps<AnalyzedPacket> & {
        context?: RowContext;
    }
> = ({ item: _item, context: _context, ...props }) => (
    <TableRow
        {...props}
        hover={true}
        onClick={() => _context?.setSelected(_item.id)}
        selected={_item.id === _context?.selected}
    />
);

const VirtuosoTableComponents: TableComponents<AnalyzedPacket, RowContext> = {
    Scroller: CustomScroller,
    Table: (props) => <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />,
    TableHead,
    TableRow: CustomTableRow,
    TableBody: CustomTableBody,
};

const commonSX = {
    padding: '2px 6px',
};

const monoSX = {
    ...commonSX,
    fontFamily: 'Roboto Mono',
    fontSize: '0.75em',
    whiteSpace: 'nowrap',
};

const FixedHeaderContent = () => {
    const theme = useTheme();

    return (
        <TableRow
            style={{
                background: theme.palette.background.paper,
                ...(theme.palette.mode === 'dark' && {
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
                }),
            }}>
            <TableCell sx={{ ...commonSX, width: '60px' }}>#</TableCell>
            <TableCell sx={{ ...commonSX, width: '60px' }}>Time</TableCell>
            <TableCell sx={{ ...commonSX, width: '60px' }}>Origin</TableCell>
            <TableCell sx={{ ...commonSX, width: '80px' }}>Direction</TableCell>
            <TableCell sx={{ ...commonSX, width: '100px' }}>Source</TableCell>
            <TableCell sx={{ ...commonSX, width: '100px' }}>Destination</TableCell>
            <TableCell sx={{ ...commonSX, width: '80px' }}>Protocol</TableCell>
            <TableCell sx={{ ...commonSX, width: '320px' }}>Info</TableCell>
        </TableRow>
    );
};

const RowContent = (i: number, v: AnalyzedPacket) => (
    <React.Fragment>
        <TableCell sx={{ ...monoSX }}>{v.id}</TableCell>
        <TableCell sx={{ ...monoSX }}>{v.time}</TableCell>
        <TableCell sx={{ ...monoSX }}>{v.origin}</TableCell>
        <TableCell sx={{ ...{ ...monoSX }, display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
            {v.direction === 'ingoing' ? (
                <CallReceived sx={{ fontSize: 16, mr: 1 }} />
            ) : (
                <CallMade sx={{ fontSize: 16, mr: 1 }} />
            )}
            {v.direction}
        </TableCell>
        <TableCell sx={{ ...monoSX }}>{v.source}</TableCell>
        <TableCell sx={{ ...monoSX }}>{v.destination}</TableCell>
        <TableCell sx={{ ...monoSX }}>{v.protocol}</TableCell>
        <TableCell sx={{ ...monoSX }}>{v.info}</TableCell>
    </React.Fragment>
);

const TreeRenderer: React.FC<{ id: string; item: AnalysisItem }> = ({ id, item }) => {
    if (item instanceof AnalysisTree) {
        const tree = item as AnalysisTree;
        return (
            <CustomTreeItem nodeId={id} label={tree.label}>
                {tree.items.map((item, key) => (
                    <TreeRenderer key={key} id={id + '-' + key} item={item} />
                ))}
            </CustomTreeItem>
        );
    } else {
        return <CustomTreeItem nodeId={id} label={item.label} />;
    }
};

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
    selection: null | [number, number];
}> = ({ buffer, space, newline, selection }) => {
    const theme = useTheme();

    const arr: number[] = Array.from(new Uint8Array(buffer).values());

    const data = divideInChunks(arr, newline).map((v: number[]) => divideInChunks(v, space));

    let start = -1;
    let end = -1;
    if (selection !== null) {
        [start, end] = selection;
    }

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

                                    if (index >= start && index <= end)
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

                                    if (index >= start && index <= end)
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

/**
 * Network analyzer component
 */
export const NetworkAnalyzer: React.FC = () => {
    const network = useContext(NetworkContext);

    const [filter, setFilter] = useState('');
    const [lastId, setLastId] = useState(0);
    const [packets, setPackets] = useState<AnalyzedPacket[]>([]);
    const [selectedPacket, setSelectedPacket] = useState<number | null>(null);
    const [selectionBounds, setSelectionBounds] = useState<null | [number, number]>(null);
    let packetsTmp: AnalyzedPacket[] = [];
    let lastIdTmp = lastId;

    const handlePacket = (e: CustomEvent<PacketEventData>) => {
        const packet = new AnalyzedPacket(
            e.detail.packet,
            lastIdTmp,
            e.detail.time,
            e.detail.interface.getOwner().getName(),
            e.detail.interface.getName(),
            e.detail.direction
        );

        const p = new Ethernet();
        p.parse(e.detail.packet);
        p.dissect(packet);
        packetsTmp = [...packetsTmp, packet];
        setPackets([...packets, ...packetsTmp]);
        lastIdTmp++;
        setLastId(lastIdTmp);
        console.log(packet);
    };

    useEffect(() => {
        network.addEventListener('packet', handlePacket as EventListener);
        return () => {
            network.removeEventListener('packet', handlePacket as EventListener);
        };
    });

    const [atBottom, setAtBottom] = useState<boolean>(true);

    const virtuosoRef = useRef<TableVirtuosoHandle>(null);

    const handleDelete = () => {
        packetsTmp = [];
        setPackets(packetsTmp);
        lastIdTmp = 0;
        setLastId(lastIdTmp);
        setSelectedPacket(null);
        setSelectionBounds(null);
    };

    let filterValid = true;
    let displayPackets: AnalyzedPacket[] = [];

    if (filter === '') {
        displayPackets = packets;
        filterValid = true;
    } else {
        try {
            const filterFunc = compileExpression(filter);
            displayPackets = packets.filter(filterFunc);
            filterValid = true;
        } catch (e) {
            filterValid = false;
            displayPackets = packets;
        }
    }

    const handleNodeSelect = (e: SyntheticEvent, nodeId: string) => {
        if (selectedPacket !== null) {
            const path = nodeId.split('-').map((v) => parseInt(v));
            path.shift();
            let item: AnalysisItem = packets[selectedPacket].tree;
            while (path.length !== 0) {
                const index = path.shift();
                if (item instanceof AnalysisTree) {
                    if (index !== undefined) {
                        item = item.items[index];
                    }
                }
            }

            setSelectionBounds(item.bounds());
        }
    };

    return (
        <PanelGroup direction='vertical'>
            <Panel defaultSize={50} style={{ display: 'flex' }}>
                <Grid
                    container
                    direction='column'
                    wrap='nowrap'
                    sx={{ height: '100%', width: '100%', overflowX: 'auto' }}>
                    <Grid item sx={{ width: '100%' }}>
                        <Stack sx={{ padding: '0px 8px', height: '32px' }} direction='row'>
                            <Stack direction='row' flexGrow={1}>
                                <Typography component='h2' variant='h6'>
                                    Packet analyzer
                                </Typography>
                            </Stack>
                            <Stack direction='row'>
                                <IconButton onClick={handleDelete} size='small' color='error'>
                                    <Delete />
                                </IconButton>
                            </Stack>
                        </Stack>
                        <Divider />
                        <Stack>
                            <FormControl variant='standard' fullWidth size='medium'>
                                <Input
                                    error={!filterValid}
                                    placeholder='Filter'
                                    startAdornment={
                                        <InputAdornment position='start'>
                                            <FilterList />
                                        </InputAdornment>
                                    }
                                    endAdornment={
                                        <InputAdornment position='end'>
                                            <IconButton onClick={() => setFilter('')}>
                                                <Clear />
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    value={filter}
                                    onChange={(e) => setFilter(e.currentTarget.value)}></Input>
                            </FormControl>
                        </Stack>
                        <Divider />
                    </Grid>
                    <Grid item sx={{ flexGrow: 1, width: '100%', position: 'relative' }}>
                        <TableVirtuoso
                            ref={virtuosoRef}
                            data={displayPackets}
                            context={{
                                selected: selectedPacket,
                                setSelected: (id: number) => {
                                    setSelectionBounds(null);
                                    setSelectedPacket(id);
                                },
                            }}
                            components={VirtuosoTableComponents}
                            fixedHeaderContent={FixedHeaderContent}
                            itemContent={RowContent}
                            atBottomStateChange={setAtBottom}
                            followOutput='auto'
                        />
                        {!atBottom ? (
                            <Fab
                                color='primary'
                                aria-label='Scroll to bottom'
                                sx={{
                                    position: 'absolute',
                                    bottom: '16px',
                                    right: '16px',
                                    zIndex: 9999,
                                }}
                                onClick={() => {
                                    if (virtuosoRef !== null && virtuosoRef.current !== null)
                                        virtuosoRef.current.scrollToIndex({
                                            index: packets.length - 1,
                                            behavior: 'smooth',
                                        });
                                }}
                                size='small'>
                                <ArrowDownward />
                            </Fab>
                        ) : (
                            <></>
                        )}
                    </Grid>
                </Grid>
            </Panel>
            {selectedPacket !== null ? (
                <>
                    <HorizontalDivider />
                    <Panel>
                        <Grid container style={{ height: '100%' }}>
                            <Grid item style={{ display: 'flex', overflow: 'auto', flexGrow: 1, height: '100%' }}>
                                <TreeView
                                    style={{ width: '100%' }}
                                    defaultCollapseIcon={<ExpandMore />}
                                    defaultExpandIcon={<ChevronRight />}
                                    onNodeSelect={handleNodeSelect}>
                                    <TreeRenderer id='0' item={packets[selectedPacket].tree} />
                                </TreeView>
                            </Grid>
                            <Grid item>
                                <Divider orientation='vertical' />
                            </Grid>
                            <Grid item style={{ overflow: 'auto', height: '100%', marginLeft: 8 }}>
                                <HexDumpRenderer
                                    buffer={packets[selectedPacket].data}
                                    space={8}
                                    newline={16}
                                    selection={selectionBounds}
                                />
                            </Grid>
                        </Grid>
                    </Panel>
                </>
            ) : (
                <></>
            )}
        </PanelGroup>
    );
};