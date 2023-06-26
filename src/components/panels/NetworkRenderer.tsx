import { AddLink, CenterFocusStrong, Hub, Label, LabelOff, LinkOff } from '@mui/icons-material';
import { Divider, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useContext, useState } from 'react';
import { CloseNetwork } from '../../icons/CloseNetwork';
import { NetworkContext } from '../../NetworkContext';
import { Layout } from '../../simulator/drawing/Layout';
import { Vector2D } from '../../simulator/drawing/Vector2D';
import { Canvas } from '../Canvas';

/**
 * Network renderer component
 */
export const NetworkRenderer: React.FC<{
    setSelected: (name: string | null) => void;
    selected: string | null;
}> = ({ setSelected, selected }) => {
    const network = useContext(NetworkContext);

    const { enqueueSnackbar } = useSnackbar();

    const [moved, setMoved] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [panning, setPanning] = useState(false);
    const [offset, setOffset] = useState(new Vector2D());
    const [mousePos, setMousePos] = useState(new Vector2D());
    const [dragged, setDragged] = useState<string | null>(null);

    const [scale, setScale] = useState<number>(1);

    const [addingLink, setAddingLink] = useState<boolean>(false);
    const [removingLink, setRemovingLink] = useState<boolean>(false);
    const [selectedDev1, setSelectedDev1] = useState<string | null>(null);

    const [removingDevice, setRemovingDevice] = useState<boolean>(false);

    const [showLabel, setShowLabel] = useState(false);

    const allActionsOff = () => {
        setRemovingDevice(false);
        setAddingLink(false);
        setRemovingLink(false);
        setSelectedDev1(null);
    };

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
                        <Tooltip title='Remove device'>
                            <IconButton
                                size='small'
                                onClick={() => {
                                    allActionsOff();
                                    if (!removingDevice) setRemovingDevice(true);
                                }}>
                                <CloseNetwork color={removingDevice ? 'error' : 'action'} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title='Add link'>
                            <IconButton
                                size='small'
                                onClick={() => {
                                    allActionsOff();
                                    if (!addingLink) setAddingLink(true);
                                }}>
                                <AddLink color={addingLink ? 'primary' : 'action'} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title='Remove link'>
                            <IconButton
                                size='small'
                                onClick={() => {
                                    allActionsOff();
                                    if (!removingLink) setRemovingLink(true);
                                }}>
                                <LinkOff color={removingLink ? 'error' : 'action'} />
                            </IconButton>
                        </Tooltip>
                        <Divider orientation='vertical' />
                        <Tooltip title='Automatic layout'>
                            <IconButton onClick={() => Layout.spring_layout(network)} size='small'>
                                <Hub />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title='Re-center view'>
                            <IconButton onClick={() => setOffset(new Vector2D(0, 0))} size='small'>
                                <CenterFocusStrong />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={showLabel ? 'Hide labels' : 'Show labels'}>
                            <IconButton onClick={() => setShowLabel(!showLabel)} size='small' edge='end'>
                                {showLabel ? <Label /> : <LabelOff />}
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>
                <Divider />
            </Grid>
            {/* TODO: Find a way to do that without using calc with a fixed height */}
            <Grid item sx={{ height: 'calc(100% - 33px)' }}>
                <Canvas
                    onMouseDown={(e) => {
                        const centerOffset = new Vector2D(e.currentTarget.width, e.currentTarget.height)
                            .mul(-0.5)
                            .div(scale);

                        setMousePos(
                            new Vector2D(
                                e.pageX - e.currentTarget.getBoundingClientRect().left,
                                e.pageY - e.currentTarget.getBoundingClientRect().top
                            ).div(scale)
                        );
                        setMoved(false);

                        // Handle adding or removing links
                        if (addingLink || removingLink) {
                            for (const dev of network.getDevices()) {
                                if (dev.collision(mousePos.sub(offset).add(centerOffset))) {
                                    if (selectedDev1 === null) {
                                        setSelectedDev1(dev.getName());
                                    } else {
                                        try {
                                            if (addingLink) {
                                                network.addLink(selectedDev1, dev.getName());
                                                enqueueSnackbar('Link added');
                                            } else if (removingLink) {
                                                network.removeLink(selectedDev1, dev.getName());
                                                enqueueSnackbar('Link removed');
                                            }
                                        } catch (e: any) {
                                            enqueueSnackbar((e as Error).message, { variant: 'error' });
                                        }
                                        allActionsOff();
                                    }
                                    return;
                                }
                            }
                        }

                        // Handle removing devices
                        if (removingDevice) {
                            for (const dev of network.getDevices()) {
                                if (dev.collision(mousePos.sub(offset).add(centerOffset))) {
                                    try {
                                        network.removeDevice(dev.getName());
                                        e.currentTarget.style.cursor = 'default';
                                        if (dev.getName() === selected) setSelected(null);
                                        enqueueSnackbar('Device ' + dev.getName() + ' removed');
                                    } catch (e: any) {
                                        enqueueSnackbar((e as Error).message, { variant: 'error' });
                                    }
                                    allActionsOff();
                                    return;
                                }
                            }
                        }

                        // Handle dragging devices
                        for (const dev of network.getDevices()) {
                            if (dev.collision(mousePos.sub(offset).add(centerOffset))) {
                                e.currentTarget.style.cursor = 'grab';
                                setDragging(true);
                                setDragged(dev.getName());
                                return;
                            }
                        }

                        // Handle panning the view
                        setPanning(true);
                    }}
                    onMouseUp={(e) => {
                        const centerOffset = new Vector2D(e.currentTarget.width, e.currentTarget.height)
                            .div(2)
                            .div(scale);

                        if (dragging && dragged !== null && !moved) {
                            setSelected(dragged);
                            setDragging(false);
                            setDragged(null);
                            return;
                        }

                        setMousePos(
                            new Vector2D(
                                e.pageX - e.currentTarget.getBoundingClientRect().left,
                                e.pageY - e.currentTarget.getBoundingClientRect().top
                            ).div(scale)
                        );

                        if (dragging && dragged !== null) {
                            e.currentTarget.style.cursor = 'pointer';
                            network.getDevice(dragged).setPosition(mousePos.sub(offset.add(centerOffset)));
                        } else if (panning) {
                            e.currentTarget.style.cursor = 'default';
                        }

                        setPanning(false);
                        setDragging(false);
                        setDragged(null);
                    }}
                    onMouseMove={(e) => {
                        const centerOffset = new Vector2D(e.currentTarget.width, e.currentTarget.height)
                            .div(2)
                            .div(scale);
                        setMousePos(
                            new Vector2D(
                                e.pageX - e.currentTarget.getBoundingClientRect().left,
                                e.pageY - e.currentTarget.getBoundingClientRect().top
                            ).div(scale)
                        );
                        setMoved(true);

                        if (dragging && dragged !== null) {
                            // Drag a device
                            e.currentTarget.style.cursor = 'grab';
                            network.getDevice(dragged).setPosition(mousePos.sub(offset.add(centerOffset)));
                        } else if (panning) {
                            // Pan the view
                            e.currentTarget.style.cursor = 'grab';
                            setOffset(offset.add(new Vector2D(e.movementX, e.movementY).div(scale)));
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
                    onWheel={(e) => {
                        // Handle zooming using the scroll wheel
                        if (e.deltaY > 0) {
                            if (scale > 0.2) {
                                setScale(scale - 0.1);
                            }
                        } else if (e.deltaY < 0) {
                            if (scale < 4) {
                                setScale(scale + 0.1);
                            }
                        }
                    }}
                    draw={(ctx) => {
                        const centerOffset = new Vector2D(ctx.canvas.width, ctx.canvas.height).div(2).div(scale);
                        /**
                         * Utility method to draw text on a gray background
                         *
                         * @param {string} text Test to draw
                         * @param {Vector2D} pos Screen-position
                         * @param {boolean} center Wether or not the text is centered arround the position
                         */
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

                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                        ctx.scale(scale, scale);

                        // Draw the links between devices
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

                        // Draw the dotted line shown when adding a link
                        if (addingLink && selectedDev1 !== null) {
                            const dev = network.getDevice(selectedDev1);

                            ctx.lineWidth = 2;
                            ctx.setLineDash([5, 5]);
                            ctx.beginPath();
                            ctx.moveTo(...dev.getPosition().add(offset.add(centerOffset)).array());
                            ctx.lineTo(...mousePos.array());
                            ctx.stroke();
                            ctx.setLineDash([]);
                        }

                        for (const dev of network.getDevices()) {
                            // Draw the devices
                            dev.draw(ctx, offset.add(centerOffset));

                            // And their labels
                            ctx.setTransform(1, 0, 0, 1, 0, 0);
                            if (showLabel) {
                                const text = dev.getText();
                                showText(
                                    text,
                                    dev
                                        .getPosition()
                                        .add(offset.add(centerOffset))
                                        .mul(scale)
                                        .add(new Vector2D(0, -40)),
                                    true
                                );
                            } else {
                                if (dev.collision(mousePos.sub(offset.add(centerOffset)))) {
                                    const text = dev.getText();
                                    showText(text, mousePos.mul(scale).add(new Vector2D(0, -20)));
                                }
                            }
                            ctx.scale(scale, scale);
                        }

                        // Draw the top-left info text
                        ctx.setTransform(1, 0, 0, 1, 0, 0);
                        showText('Offset: ' + offset.x.toFixed(2) + ';' + offset.y.toFixed(2), new Vector2D(0, 0));
                        showText('Scale: ' + scale.toFixed(2), new Vector2D(0, 21));
                        showText('Time: ' + network.time().toFixed(4), new Vector2D(0, 42));
                    }}
                    style={{ width: '100%', height: '100%', borderRadius: '0 0 4px 4px' }}></Canvas>
            </Grid>
        </Grid>
    );
};
