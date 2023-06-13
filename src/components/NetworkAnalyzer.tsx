import React, { useContext, useEffect, useState } from "react";
import { NetworkContext } from "../NetworkContexxt";
import { PacketEventData } from "../simulator/network/Network";
import { AnalyzedPacket } from "../simulator/network/packets/Packet";
import { Ethernet } from "../simulator/network/packets/definitions/Ethernet";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { CallMade, CallReceived } from "@mui/icons-material";

export const NetworkAnalyzer: React.FC = () => {
    const network = useContext(NetworkContext);

    const [lastId, setLastId] = useState(0);
    const [packets, setPackets] = useState<AnalyzedPacket[]>([]);
    let packetsTmp: AnalyzedPacket[] = [];
    let lastIdTmp = lastId;

    const handlePacket = (e: CustomEvent<PacketEventData>) => {
        console.log(e.detail.time, e.detail.direction, e.detail.interface.getFullName());
        const packet = new AnalyzedPacket(lastIdTmp, e.detail.time, e.detail.interface.getFullName(), e.detail.direction);

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

    return (
        <TableContainer sx={{ overflowX: 'visible' }}>
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={commonSX}>#</TableCell>
                        <TableCell sx={commonSX}>Time</TableCell>
                        <TableCell sx={commonSX}>Origin</TableCell>
                        <TableCell sx={commonSX}>Direction</TableCell>
                        <TableCell sx={commonSX}>Source</TableCell>
                        <TableCell sx={commonSX}>Destination</TableCell>
                        <TableCell sx={commonSX}>Protocol</TableCell>
                        <TableCell sx={commonSX}>Info</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {packets.map((v, i) => (
                        <TableRow key={i}>
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
                </TableBody>
            </Table>
        </TableContainer>
    )
}
