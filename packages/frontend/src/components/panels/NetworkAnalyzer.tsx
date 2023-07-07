import {
    ArrowDownward,
    CallMade,
    CallReceived,
    ChevronRight,
    Clear,
    Delete,
    Download,
    ExpandMore,
    FilterList,
} from '@mui/icons-material';
import TreeView from '@mui/lab/TreeView';
import {
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
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import { AnalysisItem, AnalysisTree, AnalyzedPacket, Ethernet, PacketEventData } from '@nathaj/simulator';
import { compileExpression } from 'filtrex';
import { TFunction } from 'i18next';
import React, { SyntheticEvent, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { ItemProps, TableComponents, TableVirtuoso, TableVirtuosoHandle } from 'react-virtuoso';
import { NetworkContext } from '../../NetworkContext';
import { PcapDialog } from '../dialogs/PcapDialog';
import { HexDumpRenderer } from '../HexDumpRenderer';
import { CustomTreeItem } from '../IconExpansionTreeView';
import { HorizontalDivider } from './Dividers';

interface RowContext {
    selected: null | number;
    setSelected: (id: number) => void;
    t: TFunction;
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

const CustomEmptyPlaceholder: React.FC<{
    context?: RowContext;
}> = () => {
    const { t } = useTranslation();
    return (
        <TableBody>
            <TableRow>
                <TableCell colSpan={8} sx={{ border: 'none', textAlign: 'center', padding: '8px' }}>
                    <Typography
                        sx={{
                            fontStyle: 'italic',
                            color: 'text.secondary',
                        }}
                        variant='caption'>
                        {t('panel.analyzer.nopackets')}
                    </Typography>
                </TableCell>
            </TableRow>
        </TableBody>
    );
};

const VirtuosoTableComponents: TableComponents<AnalyzedPacket, RowContext> = {
    Scroller: CustomScroller,
    Table: (props) => <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />,
    TableHead,
    TableRow: CustomTableRow,
    TableBody: CustomTableBody,
    EmptyPlaceholder: CustomEmptyPlaceholder,
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
    const { t } = useTranslation();

    return (
        <TableRow
            style={{
                background: theme.palette.background.paper,
                ...(theme.palette.mode === 'dark' && {
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
                }),
            }}>
            <TableCell sx={{ ...commonSX, width: '60px' }}>{t('panel.analyzer.columns.id')}</TableCell>
            <TableCell sx={{ ...commonSX, width: '60px' }}>{t('panel.analyzer.columns.time')}</TableCell>
            <TableCell sx={{ ...commonSX, width: '60px' }}>{t('panel.analyzer.columns.origin')}</TableCell>
            <TableCell sx={{ ...commonSX, width: '80px' }}>{t('panel.analyzer.columns.direction')}</TableCell>
            <TableCell sx={{ ...commonSX, width: '100px' }}>{t('panel.analyzer.columns.source')}</TableCell>
            <TableCell sx={{ ...commonSX, width: '100px' }}>{t('panel.analyzer.columns.destination')}</TableCell>
            <TableCell sx={{ ...commonSX, width: '80px' }}>{t('panel.analyzer.columns.protocol')}</TableCell>
            <TableCell sx={{ ...commonSX, width: '320px' }}>{t('panel.analyzer.columns.info')}</TableCell>
        </TableRow>
    );
};

const RowContent = (i: number, v: AnalyzedPacket, { t }: RowContext) => (
    <React.Fragment>
        <TableCell sx={{ ...monoSX }}>{v.id}</TableCell>
        <TableCell sx={{ ...monoSX }}>{v.time.toFixed(4)}</TableCell>
        <TableCell sx={{ ...monoSX }}>{v.origin}</TableCell>
        <TableCell sx={{ ...{ ...monoSX }, display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
            {v.direction === 'ingoing' ? (
                <CallReceived sx={{ fontSize: 16, mr: 1 }} />
            ) : (
                <CallMade sx={{ fontSize: 16, mr: 1 }} />
            )}
            {v.direction === 'ingoing' ? t('panel.analyzer.direction.ingoing') : t('panel.analyzer.direction.outgoing')}
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

/**
 * Network analyzer component
 */
export const NetworkAnalyzer: React.FC = () => {
    const network = useContext(NetworkContext);
    const { t } = useTranslation();

    const [filter, setFilter] = useState('');
    const [lastId, setLastId] = useState(0);
    const [packets, setPackets] = useState<AnalyzedPacket[]>([]);
    const [selectedPacket, setSelectedPacket] = useState<number | null>(null);
    const [selectionBounds, setSelectionBounds] = useState<null | [number, number][]>(null);
    const [exportOpen, setExportOpen] = useState(false);
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

        const p = Ethernet.ethernet(e.detail.packet);
        p.dissect(packet);
        packetsTmp = [...packetsTmp, packet];
        setPackets([...packets, ...packetsTmp]);
        lastIdTmp++;
        setLastId(lastIdTmp);
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

            setSelectionBounds(item.allBounds());
        }
    };

    return (
        <>
            <PcapDialog opened={exportOpen} close={() => setExportOpen(false)} packets={packets} />
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
                                        {t('panel.analyzer.title')}
                                    </Typography>
                                </Stack>
                                <Stack direction='row'>
                                    <Tooltip title={t('panel.analyzer.action.save')}>
                                        <IconButton onClick={() => setExportOpen(true)} size='small'>
                                            <Download />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('panel.analyzer.action.clear')}>
                                        <IconButton onClick={handleDelete} size='small' color='error'>
                                            <Delete />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Stack>
                            <Divider />
                            <Stack>
                                <FormControl variant='standard' fullWidth size='medium'>
                                    <Input
                                        error={!filterValid}
                                        placeholder={t('panel.analyzer.action.filter')}
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
                                    t: t,
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
                                    aria-label={t('panel.analyzer.action.gobottom')}
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
        </>
    );
};
