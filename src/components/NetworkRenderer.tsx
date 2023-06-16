
import { useContext, useState } from "react";
import { NetworkContext } from "../NetworkContexxt";
import { Canvas } from "./Canvas";
import { Divider, Grid, IconButton, Stack, Typography } from "@mui/material";
import { CenterFocusStrong, Hub, Label, LabelOff, Shuffle } from "@mui/icons-material";
import { Vector2D } from "../simulator/drawing/Vector2D";
import { Layout } from "../simulator/drawing/Layout";

export const NetworkRenderer: React.FC = () => {
    const network = useContext(NetworkContext);

    const [dragging, setDragging] = useState(false);
    const [panning, setPanning] = useState(false);
    const [offset, setOffset] = useState(new Vector2D);
    const [mousePos, setMousePos] = useState(new Vector2D);
    const [dragged, setDragged] = useState<string | null>(null);

    const [showLabel, setShowLabel] = useState(false);

    return (
        <Grid container direction="column" flexWrap="nowrap" sx={{ height: "100%" }}>
            <Grid item sx={{ width: "100%" }}>
                <Stack sx={{ p: 1, height: "32px" }} direction="row">
                    <Stack direction="row" flexGrow={1}>
                        <Typography component='h2' variant='h6'>Network</Typography>
                    </Stack>
                    <Stack direction="row">
                        <IconButton onClick={() => Layout.spring_layout(network)} size="small">
                            <Hub />
                        </IconButton>
                        <IconButton onClick={() => setOffset(new Vector2D(0,0))} size="small">
                            <CenterFocusStrong />
                        </IconButton>
                        <IconButton onClick={() => setShowLabel(!showLabel)} size="small">
                            {showLabel ? <Label /> : <LabelOff />}
                        </IconButton>
                    </Stack>
                </Stack>
                <Divider />
            </Grid>
            <Grid item sx={{ height: "calc(100% - 50px)" }}>
                <Canvas onMouseDown={(e) => {
                    const centerOffset = new Vector2D(e.currentTarget.width, e.currentTarget.height).mul(-0.5);

                    setMousePos(new Vector2D(
                        e.pageX - e.currentTarget.getBoundingClientRect().left,
                        e.pageY - e.currentTarget.getBoundingClientRect().top
                    ));

                    for (const dev of Object.values(network.devices)) {
                        if (dev.collision(mousePos.sub(offset).add(centerOffset))) {
                            e.currentTarget.style.cursor = 'grab';
                            setDragging(true);
                            setDragged(dev.name);
                            return;
                        }
                    }

                    setPanning(true);
                }} onMouseUp={(e) => {
                    const centerOffset = new Vector2D(e.currentTarget.width, e.currentTarget.height).div(2);

                    setMousePos(new Vector2D(
                        e.pageX - e.currentTarget.getBoundingClientRect().left,
                        e.pageY - e.currentTarget.getBoundingClientRect().top
                    ));

                    if (dragging && dragged !== null) {
                        e.currentTarget.style.cursor = 'pointer';
                        network.devices[dragged].position = mousePos.sub(offset.add(centerOffset));
                    } else if (panning) {
                        e.currentTarget.style.cursor = 'pointer';
                    }

                    setPanning(false);
                    setDragging(false);
                    setDragged(null);
                }} onMouseMove={(e) => {
                    const centerOffset = new Vector2D(e.currentTarget.width, e.currentTarget.height).div(2);
                    setMousePos(new Vector2D(
                        e.pageX - e.currentTarget.getBoundingClientRect().left,
                        e.pageY - e.currentTarget.getBoundingClientRect().top
                    ));

                    if (dragging && dragged !== null) {
                        e.currentTarget.style.cursor = 'grab';
                        network.devices[dragged].position = mousePos.sub(offset.add(centerOffset));
                    } else if (panning) {
                        e.currentTarget.style.cursor = 'grab';
                        setOffset(offset.add(new Vector2D(e.movementX, e.movementY)));
                    } else {
                        for (const dev of Object.values(network.devices)) {
                            if (dev.collision(mousePos.sub(offset.add(centerOffset)))) {
                                e.currentTarget.style.cursor = 'pointer';
                                return;
                            }
                        }
                        e.currentTarget.style.cursor = 'default';
                    }
                }} draw={(ctx, frame) => {
                    const centerOffset = new Vector2D(ctx.canvas.width, ctx.canvas.height).div(2);
                    const showText = (text: string, pos: Vector2D, center: boolean = false) => {
                        const HEIGHT = 18;
                        ctx.font = HEIGHT + "px monospace";
                        const { width } = ctx.measureText(text);
                        ctx.fillStyle = "#000000AA"
                        const rectPos = pos.sub(new Vector2D(3 + (center ? width / 2 : 0), 0));
                        ctx.fillRect(rectPos.x, rectPos.y, width + 6, HEIGHT + 3);
                        ctx.fillStyle = "#FFFFFF"
                        const textPos = pos.sub(new Vector2D((center ? width / 2 : 0), -HEIGHT));
                        ctx.fillText(text, textPos.x, textPos.y);
                    }

                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    

                    for (const dev of Object.values(network.devices)) {
                        for (const intf of Object.values(dev.interfaces)) {
                            if (intf.connected_to !== null) {
                                ctx.lineWidth = 2;
                                ctx.beginPath();
                                ctx.moveTo(...dev.position.add(offset.add(centerOffset)).array());
                                ctx.lineTo(...intf.connected_to.getOwner().position.add(offset.add(centerOffset)).array());
                                ctx.stroke();
                            }
                        }
                    }

                    for (const dev of Object.values(network.devices)) {
                        dev.draw(ctx, offset.add(centerOffset));

                        if (showLabel) {
                            const text = dev.getText();
                            const HEIGHT = 18;
                            showText(text, dev.position.add(offset.add(centerOffset)).add(new Vector2D(0, -40)), true);
                        } else {
                            if (dev.collision(mousePos.sub(offset.add(centerOffset)))) {
                                const text = dev.getText();
                                showText(text, mousePos.add(new Vector2D(0, -20)));
                            }
                        }
                    }

                    showText("Offset: " + offset.x + ";" + offset.y, new Vector2D(0, 0));
                    showText("Time: " + network.time(), new Vector2D(0, 21));

                }} style={{ width: "100%", height: "100%", borderRadius: '0 0 4px 4px' }}></Canvas>
            </Grid>
        </Grid>
    )
};
