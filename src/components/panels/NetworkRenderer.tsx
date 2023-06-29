import { AddLink, CenterFocusStrong, GridOn, Hub, Label, LinkOff } from '@mui/icons-material';
import { Divider, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { Touch, useContext, useState } from 'react';
import { CloseNetwork } from '../../icons/CloseNetwork';
import { SnapToGrid } from '../../icons/SnapToGrid';
import { NetworkContext } from '../../NetworkContext';
import { Layout } from '../../simulator/drawing/Layout';
import { Vector2D } from '../../simulator/drawing/Vector2D';
import { Canvas } from '../Canvas';
import { AddMenu } from '../menus/AddMenu';

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
    const [startScale, setStartScale] = useState<number>(1);

    const [addingLink, setAddingLink] = useState<boolean>(false);
    const [removingLink, setRemovingLink] = useState<boolean>(false);
    const [selectedDev1, setSelectedDev1] = useState<string | null>(null);

    const [removingDevice, setRemovingDevice] = useState<boolean>(false);

    const [showLabel, setShowLabel] = useState(false);
    const [showGrid, setShowGrid] = useState(false);
    const [snapGrid, setSnapGrid] = useState(false);

    const allActionsOff = () => {
        setRemovingDevice(false);
        setAddingLink(false);
        setRemovingLink(false);
        setSelectedDev1(null);
    };

    type SavedTouch = {
        identifier: number;
        pageX: number;
        pageY: number;
        startX: number;
        startY: number;
        previousX: number;
        previousY: number;
    };

    const [touches, setTouches] = useState<SavedTouch[]>([]);

    const startTouch = (e: Touch, r: DOMRect): SavedTouch => ({
        identifier: e.identifier,
        pageX: e.pageX - r.left,
        pageY: e.pageY - r.top,
        startX: e.pageX - r.left,
        startY: e.pageY - r.top,
        previousX: e.pageX - r.left,
        previousY: e.pageY - r.top,
    });

    const moveTouch = (e: Touch, o: SavedTouch, r: DOMRect): SavedTouch => ({
        identifier: e.identifier,
        pageX: e.pageX - r.left,
        pageY: e.pageY - r.top,
        startX: o.startX,
        startY: o.startY,
        previousX: o.pageX,
        previousY: o.pageY,
    });

    let tmpTouches: SavedTouch[] = touches;

    const GRID_SIZE = scale >= 1 ? 25 : scale >= 0.3 ? 50 : 100;

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
                        <AddMenu icon />
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
                            <IconButton onClick={() => Layout.spring_layout(network, GRID_SIZE, snapGrid)} size='small'>
                                <Hub />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title='Center view'>
                            <IconButton onClick={() => setOffset(new Vector2D(0, 0))} size='small'>
                                <CenterFocusStrong />
                            </IconButton>
                        </Tooltip>
                        <Divider orientation='vertical' />
                        <Tooltip title='Toggle labels'>
                            <IconButton
                                onClick={() => setShowLabel(!showLabel)}
                                size='small'
                                edge='end'
                                color={showLabel ? 'primary' : 'default'}>
                                <Label />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title='Toggle snap to grid'>
                            <IconButton
                                onClick={() => setSnapGrid(!snapGrid)}
                                size='small'
                                edge='end'
                                color={snapGrid ? 'primary' : 'default'}>
                                <SnapToGrid />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title='Toggle grid'>
                            <IconButton
                                onClick={() => setShowGrid(!showGrid)}
                                size='small'
                                edge='end'
                                color={showGrid ? 'primary' : 'default'}>
                                <GridOn />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>
                <Divider />
            </Grid>
            {/* TODO: Find a way to do that without using calc with a fixed height */}
            <Grid item sx={{ height: 'calc(100% - 33px)' }}>
                <Canvas
                    onTouchStart={(e) => {
                        e.preventDefault();

                        // Add the new touch to the list of touches
                        for (let i = 0; i < e.changedTouches.length; i++) {
                            tmpTouches = [
                                ...tmpTouches,
                                startTouch(e.changedTouches[i], e.currentTarget.getBoundingClientRect()),
                            ];
                        }
                        setTouches(tmpTouches);

                        if (tmpTouches.length === 1) {
                            const pointer = tmpTouches[0];

                            setMousePos(new Vector2D(pointer.pageX, pointer.pageY).div(scale));
                            const centerOffset = new Vector2D(e.currentTarget.width, e.currentTarget.height)
                                .mul(-0.5)
                                .div(scale);

                            const touch = tmpTouches[0];
                            const page = new Vector2D(touch.pageX, touch.pageY).div(scale);
                            // Handle dragging devices
                            for (const dev of network.getDevices()) {
                                if (dev.collision(page.sub(offset).add(centerOffset))) {
                                    e.currentTarget.style.cursor = 'grab';
                                    setDragging(true);
                                    setDragged(dev.getName());
                                    return;
                                }
                            }
                        }
                    }}
                    onTouchMove={(e) => {
                        e.preventDefault();
                        const newTmpTouches: SavedTouch[] = [];
                        for (let i = 0; i < e.touches.length; i++) {
                            const touch = tmpTouches.find((t) => t.identifier === e.changedTouches[i].identifier);
                            if (touch === undefined) continue;

                            newTmpTouches.push(moveTouch(e.touches[i], touch, e.currentTarget.getBoundingClientRect()));
                        }
                        tmpTouches = newTmpTouches;
                        setTouches(tmpTouches);

                        if (tmpTouches.length === 1) {
                            const pointer = tmpTouches[0];
                            setMousePos(new Vector2D(pointer.pageX, pointer.pageY).div(scale));

                            if (dragging && dragged !== null) {
                                // Drag a device
                                const centerOffset = new Vector2D(e.currentTarget.width, e.currentTarget.height)
                                    .mul(-0.5)
                                    .div(scale);

                                e.currentTarget.style.cursor = 'grab';
                                network
                                    .getDevice(dragged)
                                    .setPosition(mousePos.sub(offset).add(centerOffset).align(GRID_SIZE, snapGrid));
                                return;
                            }

                            setOffset(
                                offset.add(
                                    new Vector2D(
                                        pointer.pageX - pointer.previousX,
                                        pointer.pageY - pointer.previousY
                                    ).div(scale)
                                )
                            );
                        }
                        if (tmpTouches.length === 2) {
                            const a = tmpTouches[0];
                            const b = tmpTouches[1];
                            const startDist = new Vector2D(a.startX, a.startY).dist(new Vector2D(b.startX, b.startY));
                            const currentDist = new Vector2D(a.pageX, a.pageY).dist(new Vector2D(b.pageX, b.pageY));

                            const diff = currentDist - startDist;
                            let tmpScale = startScale + diff / 100;
                            if (tmpScale < 0.1) tmpScale = 0.1;
                            if (tmpScale > 4) tmpScale = 4;

                            setScale(tmpScale);
                        } else {
                            setStartScale(scale);
                        }
                    }}
                    onTouchEnd={(e) => {
                        e.preventDefault();

                        for (let i = 0; i < e.changedTouches.length; i++) {
                            tmpTouches = tmpTouches.filter((t) => t.identifier !== e.changedTouches[i].identifier);
                        }
                        setTouches(tmpTouches);

                        if (touches.length === 1) {
                            const pointer = touches[0];

                            const start = new Vector2D(pointer.startX, pointer.startY);
                            const page = new Vector2D(pointer.pageX, pointer.pageY);

                            if (dragging && dragged !== null) {
                                setDragging(false);
                                setDragged(null);
                            }

                            if (start.sqdist(page) < 100) {
                                // We clicked on an element
                                const centerOffset = new Vector2D(e.currentTarget.width, e.currentTarget.height)
                                    .mul(-0.5)
                                    .div(scale);

                                // Handle adding or removing links
                                if (addingLink || removingLink) {
                                    for (const dev of network.getDevices()) {
                                        if (dev.collision(page.div(scale).sub(offset).add(centerOffset))) {
                                            if (selectedDev1 === null) {
                                                setSelectedDev1(dev.getName());
                                            } else {
                                                try {
                                                    if (addingLink) {
                                                        network.addLink(selectedDev1, dev.getName());
                                                        setSelectedDev1(null);
                                                        enqueueSnackbar('Link added');
                                                    } else if (removingLink) {
                                                        network.removeLink(selectedDev1, dev.getName());
                                                        setSelectedDev1(null);
                                                        enqueueSnackbar('Link removed');
                                                    }
                                                } catch (e: any) {
                                                    enqueueSnackbar((e as Error).message, { variant: 'error' });
                                                }
                                            }
                                            return;
                                        }
                                    }
                                }

                                // Handle removing devices
                                if (removingDevice) {
                                    for (const dev of network.getDevices()) {
                                        if (dev.collision(page.div(scale).sub(offset).add(centerOffset))) {
                                            try {
                                                network.removeDevice(dev.getName());
                                                e.currentTarget.style.cursor = 'default';
                                                if (dev.getName() === selected) setSelected(null);
                                                enqueueSnackbar('Device ' + dev.getName() + ' removed');
                                            } catch (e: any) {
                                                enqueueSnackbar((e as Error).message, { variant: 'error' });
                                            }
                                            return;
                                        }
                                    }
                                }

                                // Handle selecting
                                for (const dev of network.getDevices()) {
                                    if (dev.collision(page.div(scale).sub(offset).add(centerOffset))) {
                                        setSelected(dev.getName());
                                        setDragging(false);
                                        setDragged(null);
                                        return;
                                    }
                                }
                            }
                        }
                        if (tmpTouches.length !== 2) {
                            setStartScale(scale);
                        }
                    }}
                    onTouchCancel={(e) => {
                        e.preventDefault();
                        for (let i = 0; i < e.changedTouches.length; i++) {
                            setTouches(touches.filter((t) => t.identifier !== e.changedTouches[i].identifier));
                        }
                    }}
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
                                                setSelectedDev1(null);
                                                enqueueSnackbar('Link added');
                                            } else if (removingLink) {
                                                network.removeLink(selectedDev1, dev.getName());
                                                setSelectedDev1(null);
                                                enqueueSnackbar('Link removed');
                                            }
                                        } catch (e: any) {
                                            enqueueSnackbar((e as Error).message, { variant: 'error' });
                                        }
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
                            network
                                .getDevice(dragged)
                                .setPosition(mousePos.sub(offset.add(centerOffset)).align(GRID_SIZE, snapGrid));
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
                            network
                                .getDevice(dragged)
                                .setPosition(mousePos.sub(offset.add(centerOffset)).align(GRID_SIZE, snapGrid));
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
                        const showText = (
                            text: string,
                            pos: Vector2D,
                            center = false,
                            verticalCenter = false,
                            height = 18
                        ) => {
                            ctx.font = height + 'px monospace';
                            const { width } = ctx.measureText(text);
                            ctx.fillStyle = '#000000AA';
                            const rectPos = pos.sub(new Vector2D(3 + (center ? width / 2 : 0), 0));
                            ctx.fillRect(
                                rectPos.x,
                                rectPos.y - (verticalCenter ? height / 2 : 0),
                                width + 6,
                                height + 3
                            );
                            ctx.fillStyle = '#FFFFFF';
                            const textPos = pos.sub(new Vector2D(center ? width / 2 : 0, -height));
                            ctx.fillText(text, textPos.x, textPos.y - (verticalCenter ? height / 2 : 0));
                        };

                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                        ctx.scale(scale, scale);

                        ctx.fillStyle = '#000000';

                        // Drazw the grid
                        if (showGrid) {
                            for (
                                let i =
                                    (offset.x % GRID_SIZE) +
                                    centerOffset.x -
                                    Math.ceil(centerOffset.x / GRID_SIZE) * GRID_SIZE;
                                i < centerOffset.x * 2;
                                i += GRID_SIZE
                            ) {
                                for (
                                    let j =
                                        (offset.y % GRID_SIZE) +
                                        centerOffset.y -
                                        Math.ceil(centerOffset.y / GRID_SIZE) * GRID_SIZE;
                                    j < centerOffset.y * 2;
                                    j += GRID_SIZE
                                ) {
                                    ctx.fillRect(i, j, 1, 1);
                                }
                            }
                        }

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
                                        .add(new Vector2D(0, -24))
                                        .mul(scale),
                                    true,
                                    true,
                                    16
                                );
                            } else {
                                if (dev.collision(mousePos.sub(offset.add(centerOffset)))) {
                                    const text = dev.getText();
                                    showText(text, mousePos.mul(scale).add(new Vector2D(0, -24)), true, false, 16);
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
