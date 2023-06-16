import React, { useContext, useEffect, useRef, useState } from "react";
import { NetworkContext } from "../NetworkContexxt";
import { PacketEventData } from "../simulator/network/Network";
import { AnalyzedPacket } from "../simulator/network/packets/Packet";
import { Ethernet } from "../simulator/network/packets/definitions/Ethernet";
import { Divider, FormControl, Grid, IconButton, Input, InputAdornment, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { CallMade, CallReceived, Clear, Delete, FileDownload, FileDownloadOff, Filter, FilterList } from "@mui/icons-material";
import { compileExpression } from 'filtrex';

export const NetworkAnalyzer: React.FC = () => {
    const network = useContext(NetworkContext);

    const [filter, setFilter] = useState("");
    const [lastId, setLastId] = useState(0);
    const [packets, setPackets] = useState<AnalyzedPacket[]>([]);
    const [selectedPacket, setSelectedPacket] = useState<number | null>(null);
    let packetsTmp: AnalyzedPacket[] = [];
    let lastIdTmp = lastId;

    const handlePacket = (e: CustomEvent<PacketEventData>) => {
        console.log(e.detail.time, e.detail.direction, e.detail.interface.getFullName());
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

    const commonSX = {
        padding: "2px 6px",
    }

    const monoSX = {
        ...commonSX,
        fontFamily: "Roboto Mono",
        fontSize: "0.75em",
        whiteSpace: 'nowrap'
    }

    const [autoScroll, setAutoScroll] = useState(true);
    const tableEndRef = useRef<HTMLDivElement>(null);
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
            <Grid item sx={{ flexGrow: 1, width: "100%", overflowX: 'scroll', overflowY: 'scroll' }}>
                <TableContainer sx={{ overflowX: 'visible' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={commonSX}>#</TableCell>
                                <TableCell sx={commonSX}>Time</TableCell>
                                <TableCell sx={commonSX}>Origin
                                    {/* <IconButton size="small">
                                    <FilterList fontSize="inherit" />
                                </IconButton>*/}</TableCell>
                                <TableCell sx={commonSX}>Direction</TableCell>
                                <TableCell sx={commonSX}>Source</TableCell>
                                <TableCell sx={commonSX}>Destination</TableCell>
                                <TableCell sx={commonSX}>Protocol</TableCell>
                                <TableCell sx={commonSX}>Info</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayPackets.map((v, i) => (
                                <TableRow key={i} hover selected={selectedPacket === i} onClick={(e) => { e.stopPropagation(); setSelectedPacket(i) }}>
                                    <TableCell sx={monoSX}>{v.id}</TableCell>
                                    <TableCell sx={monoSX}>{v.time}</TableCell>
                                    <TableCell sx={monoSX}>{v.origin}</TableCell>
                                    <TableCell sx={{ ...monoSX, display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
                                        {v.direction === 'ingoing' ?
                                            <CallReceived sx={{ fontSize: 16, mr: 1 }} /> :
                                            <CallMade sx={{ fontSize: 16, mr: 1 }} />
                                        }
                                        {v.direction}
                                    </TableCell>
                                    <TableCell sx={monoSX}>{v.source}</TableCell>
                                    <TableCell sx={monoSX}>{v.destination}</TableCell>
                                    <TableCell sx={monoSX}>{v.protocol}</TableCell>
                                    <TableCell sx={monoSX}>{v.info}</TableCell>
                                </TableRow>
                            ))}
                            <div ref={tableEndRef}></div>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    )
}
