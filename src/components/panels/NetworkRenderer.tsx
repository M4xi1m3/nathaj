import { AddLink, CenterFocusStrong, Hub, Label, LabelOff } from '@mui/icons-material';
import { Divider, Grid, IconButton, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useContext, useState } from 'react';
import { NetworkContext } from '../../NetworkContext';
import { Layout } from '../../simulator/drawing/Layout';
import { Vector2D } from '../../simulator/drawing/Vector2D';
import { Canvas } from '../Canvas';

/**
 * Network renderer component
 */
export const NetworkRenderer: React.FC = () => {
    const network = useContext(NetworkContext);

    const { enqueueSnackbar } = useSnackbar();

    const [dragging, setDragging] = useState(false);
    const [panning, setPanning] = useState(false);
    const [offset, setOffset] = useState(new Vector2D());
    const [mousePos, setMousePos] = useState(new Vector2D());
    const [dragged, setDragged] = useState<string | null>(null);
    const [addingLink, setAddingLink] = useState<boolean>(false);
    const [linkDev1, setLinkDev1] = useState<string | null>(null);

    const [showLabel, setShowLabel] = useState(false);

    return (
        <Grid container direction='column' flexWrap='nowrap' sx={{ height: '100%' }}>
            <Grid item sx={{ width: '100%' }}>
                <Stack sx={{ padding: '0px 8px', height: '32px' }} direction='row'>
                    <Stack direction='row' flexGrow={1}>
                        <Typography component='h2' variant='h6'>
                            Network
                        </Typography>
                    </Stack>
                    <Stack direction='row'>
                        <IconButton
                            size='small'
                            onClick={() => {
                                if (addingLink) {
                                    setAddingLink(false);
                                    setLinkDev1(null);
                                } else {
                                    setAddingLink(true);
                                }
                            }}>
                            <AddLink color={addingLink ? 'primary' : 'action'} />
                        </IconButton>
                        <IconButton onClick={() => Layout.spring_layout(network)} size='small'>
                            <Hub />
                        </IconButton>
                        <IconButton onClick={() => setOffset(new Vector2D(0, 0))} size='small'>
                            <CenterFocusStrong />
                        </IconButton>
                        <IconButton onClick={() => setShowLabel(!showLabel)} size='small'>
                            {showLabel ? <Label /> : <LabelOff />}
                        </IconButton>
                    </Stack>
                </Stack>
                <Divider />
            </Grid>
            <Grid item sx={{ height: 'calc(100% - 50px)' }}>
                <Canvas
                    onMouseDown={(e) => {
                        const centerOffset = new Vector2D(e.currentTarget.width, e.currentTarget.height).mul(-0.5);

                        setMousePos(
                            new Vector2D(
                                e.pageX - e.currentTarget.getBoundingClientRect().left,
                                e.pageY - e.currentTarget.getBoundingClientRect().top
                            )
                        );

                        if (addingLink) {
                            for (const dev of network.getDevices()) {
                                if (dev.collision(mousePos.sub(offset).add(centerOffset))) {
                                    if (linkDev1 === null) {
                                        setLinkDev1(dev.getName());
                                    } else {
                                        try {
                                            network.addLink(linkDev1, dev.getName());
                                        } catch (e: any) {
                                            enqueueSnackbar((e as Error).message, { variant: 'error' });
                                        }
                                        setLinkDev1(null);
                                        setAddingLink(false);
                                    }
                                    return;
                                }
                            }
                        }

                        for (const dev of network.getDevices()) {
                            if (dev.collision(mousePos.sub(offset).add(centerOffset))) {
                                e.currentTarget.style.cursor = 'grab';
                                setDragging(true);
                                setDragged(dev.getName());
                                return;
                            }
                        }

                        setPanning(true);
                    }}
                    onMouseUp={(e) => {
                        const centerOffset = new Vector2D(e.currentTarget.width, e.currentTarget.height).div(2);

                        setMousePos(
                            new Vector2D(
                                e.pageX - e.currentTarget.getBoundingClientRect().left,
                                e.pageY - e.currentTarget.getBoundingClientRect().top
                            )
                        );

                        if (dragging && dragged !== null) {
                            e.currentTarget.style.cursor = 'pointer';
                            network.getDevice(dragged).setPosition(mousePos.sub(offset.add(centerOffset)));
                        } else if (panning) {
                            e.currentTarget.style.cursor = 'pointer';
                        }

                        setPanning(false);
                        setDragging(false);
                        setDragged(null);
                    }}
                    onMouseMove={(e) => {
                        const centerOffset = new Vector2D(e.currentTarget.width, e.currentTarget.height).div(2);
                        setMousePos(
                            new Vector2D(
                                e.pageX - e.currentTarget.getBoundingClientRect().left,
                                e.pageY - e.currentTarget.getBoundingClientRect().top
                            )
                        );

                        if (dragging && dragged !== null) {
                            e.currentTarget.style.cursor = 'grab';
                            network.getDevice(dragged).setPosition(mousePos.sub(offset.add(centerOffset)));
                        } else if (panning) {
                            e.currentTarget.style.cursor = 'grab';
                            setOffset(offset.add(new Vector2D(e.movementX, e.movementY)));
                        } else {
                            for (const dev of network.getDevices()) {
                                if (dev.collision(mousePos.sub(offset.add(centerOffset)))) {
                                    e.currentTarget.style.cursor = 'pointer';
                                    return;
                                }
                            }
                            e.currentTarget.style.cursor = 'default';
                        }
                    }}
                    draw={(ctx) => {
                        const centerOffset = new Vector2D(ctx.canvas.width, ctx.canvas.height).div(2);
                        const showText = (text: string, pos: Vector2D, center = false) => {
                            const HEIGHT = 18;
                            ctx.font = HEIGHT + 'px monospace';
                            const { width } = ctx.measureText(text);
                            ctx.fillStyle = '#000000AA';
                            const rectPos = pos.sub(new Vector2D(3 + (center ? width / 2 : 0), 0));
                            ctx.fillRect(rectPos.x, rectPos.y, width + 6, HEIGHT + 3);
                            ctx.fillStyle = '#FFFFFF';
                            const textPos = pos.sub(new Vector2D(center ? width / 2 : 0, -HEIGHT));
                            ctx.fillText(text, textPos.x, textPos.y);
                        };

                        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                        for (const dev of network.getDevices()) {
                            for (const intf of dev.getInterfaces()) {
                                if (intf.getConnection() !== null) {
                                    ctx.lineWidth = 2;
                                    ctx.beginPath();
                                    ctx.moveTo(...dev.getPosition().add(offset.add(centerOffset)).array());
                                    ctx.lineTo(
                                        ...(intf
                                            .getConnection()
                                            ?.getOwner()
                                            ?.getPosition()
                                            ?.add(offset.add(centerOffset))
                                            ?.array() ?? [0, 0])
                                    );
                                    ctx.stroke();
                                }
                            }
                        }

                        for (const dev of network.getDevices()) {
                            dev.draw(ctx, offset.add(centerOffset));

                            if (showLabel) {
                                const text = dev.getText();
                                showText(
                                    text,
                                    dev.getPosition().add(offset.add(centerOffset)).add(new Vector2D(0, -40)),
                                    true
                                );
                            } else {
                                if (dev.collision(mousePos.sub(offset.add(centerOffset)))) {
                                    const text = dev.getText();
                                    showText(text, mousePos.add(new Vector2D(0, -20)));
                                }
                            }
                        }

                        showText('Offset: ' + offset.x + ';' + offset.y, new Vector2D(0, 0));
                        showText('Time: ' + network.time(), new Vector2D(0, 21));
                    }}
                    style={{ width: '100%', height: '100%', borderRadius: '0 0 4px 4px' }}></Canvas>
            </Grid>
        </Grid>
    );
};
