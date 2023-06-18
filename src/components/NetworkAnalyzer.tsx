import React, { useContext, useEffect, useRef, useState } from "react";
import { NetworkContext } from "../NetworkContext";
import { PacketEventData } from "../simulator/network/Network";
import { AnalyzedPacket } from "../simulator/network/packets/Packet";
import { Ethernet } from "../simulator/network/packets/definitions/Ethernet";
import { Divider, FormControl, Grid, IconButton, Input, InputAdornment, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { CallMade, CallReceived, Clear, Delete, FileDownload, FileDownloadOff, FilterList } from "@mui/icons-material";
import { compileExpression } from 'filtrex';
import { TableComponents, TableVirtuoso } from 'react-virtuoso';

interface RowContext {
    selected: null | number;
    setSelected: (id: number) => void;
}

const VirtuosoTableComponents: TableComponents<AnalyzedPacket, RowContext> = {
    Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
        <TableContainer {...props} ref={ref} />
    )),
    Table: (props) => (
        <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />
    ),
    TableHead,
    TableRow: ({ item: _item, context: _context, ...props }) => <TableRow {...props} hover={true} onClick={() => _context?.setSelected(_item.id)} selected={_item.id === _context?.selected} />,
    TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
        <TableBody {...props} ref={ref} />
    )),
};

const commonSX = {
    padding: "2px 6px",
}

const monoSX = {
    ...commonSX,
    fontFamily: "Roboto Mono",
    fontSize: "0.75em",
    whiteSpace: 'nowrap'
}

const FixedHeaderContent = () => (
    <TableRow style={{background: 'white'}}>
        <TableCell sx={{ ...commonSX, width: "80px" }}>#</TableCell>
        <TableCell sx={{ ...commonSX, width: "80px" }}>Time</TableCell>
        <TableCell sx={{ ...commonSX, width: "80px" }}>Origin</TableCell>
        <TableCell sx={{ ...commonSX, width: "100px" }}>Direction</TableCell>
        <TableCell sx={{ ...commonSX, width: "140px" }}>Source</TableCell>
        <TableCell sx={{ ...commonSX, width: "140px" }}>Destination</TableCell>
        <TableCell sx={{ ...commonSX, width: "80px" }}>Protocol</TableCell>
        <TableCell sx={{ ...commonSX, width: "320px" }}>Info</TableCell>
    </TableRow>
)

const RowContent = (i: number, v: AnalyzedPacket, c: RowContext) => (
    <React.Fragment>
        <TableCell sx={{ ...monoSX }}>{v.id}</TableCell>
        <TableCell sx={{ ...monoSX }}>{v.time}</TableCell>
        <TableCell sx={{ ...monoSX }}>{v.origin}</TableCell>
        <TableCell sx={{ ...{ ...monoSX }, display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
            {v.direction === 'ingoing' ?
                <CallReceived sx={{ fontSize: 16, mr: 1 }} /> :
                <CallMade sx={{ fontSize: 16, mr: 1 }} />
            }
            {v.direction}
        </TableCell>
        <TableCell sx={{ ...monoSX }}>{v.source}</TableCell>
        <TableCell sx={{ ...monoSX }}>{v.destination}</TableCell>
        <TableCell sx={{ ...monoSX }}>{v.protocol}</TableCell>
        <TableCell sx={{ ...monoSX }}>{v.info}</TableCell>
    </React.Fragment>
)

export const NetworkAnalyzer: React.FC = () => {
    const network = useContext(NetworkContext);

    const [filter, setFilter] = useState("");
    const [lastId, setLastId] = useState(0);
    const [packets, setPackets] = useState<AnalyzedPacket[]>([]);
    const [selectedPacket, setSelectedPacket] = useState<number | null>(null);
    let packetsTmp: AnalyzedPacket[] = [];
    let lastIdTmp = lastId;

    const handlePacket = (e: CustomEvent<PacketEventData>) => {
        const packet = new AnalyzedPacket(lastIdTmp, e.detail.time, e.detail.interface.getOwner().getName(), e.detail.interface.getName(), e.detail.direction);

        const p = new Ethernet();
        p.parse(e.detail.packet);
        p.dissect(packet);
        packetsTmp = [...packetsTmp, packet]
        setPackets([...packets, ...packetsTmp]);
        lastIdTmp++;
        setLastId(lastIdTmp);
    }

    useEffect(() => {

        network.addEventListener('packet', handlePacket as EventListener)
        return () => {
            network.removeEventListener('packet', handlePacket as EventListener);
        }
    });

    const [autoScroll, setAutoScroll] = useState(true);
    const tableEndRef = useRef<HTMLTableRowElement>(null);
    useEffect(() => {
        if (autoScroll)
            tableEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [packets, autoScroll]);

    const handleAutoScroll = () => {
        setAutoScroll(!autoScroll);
    }

    const handleDelete = () => {
        packetsTmp = [];
        setPackets(packetsTmp);
        lastIdTmp = 0;
        setLastId(lastIdTmp);
        setSelectedPacket(null);
    }

    let filterValid = true;
    let displayPackets: AnalyzedPacket[] = [];

    if (filter === "") {
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

    return (
        <Grid container direction="column" wrap="nowrap" sx={{ height: "100%", width: "100%", overflowX: "auto" }}>
            <Grid item sx={{ width: "100%" }}>
                <Stack sx={{ p: 1, height: "32px" }} direction="row">
                    <Stack direction="row" flexGrow={1}>
                        <Typography component='h2' variant='h6'>Packet analyzer</Typography>
                    </Stack>
                    <Stack direction="row">
                        <IconButton onClick={handleAutoScroll} size="small">
                            {autoScroll ? <FileDownload /> : <FileDownloadOff />}
                        </IconButton>
                        <IconButton onClick={handleDelete} size="small" color="error">
                            <Delete />
                        </IconButton>
                    </Stack>
                </Stack>
                <Divider />
                <Stack>
                    <FormControl variant="standard" fullWidth size="medium">
                        <Input error={!filterValid} placeholder="Filter" startAdornment={
                            <InputAdornment position="start">
                                <FilterList />
                            </InputAdornment>
                        } endAdornment={
                            <InputAdornment position="end">
                                <IconButton onClick={() => setFilter("")}>
                                    <Clear />
                                </IconButton>
                            </InputAdornment>
                        } value={filter} onChange={(e) => setFilter(e.currentTarget.value)}></Input>
                    </FormControl>
                </Stack>
                <Divider />
            </Grid>
            <Grid item sx={{ flexGrow: 1, width: "100%" }}>
                <TableVirtuoso data={displayPackets} context={{selected: selectedPacket, setSelected: setSelectedPacket}} components={VirtuosoTableComponents}
                    fixedHeaderContent={FixedHeaderContent} itemContent={RowContent} followOutput={(isAtBottom: boolean) => (autoScroll ? 'smooth' : false)} />
            </Grid>
        </Grid>
    )
}
