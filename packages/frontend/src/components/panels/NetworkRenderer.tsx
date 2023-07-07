import { AddLink, CenterFocusStrong, GridOn, Hub, Label, LinkOff } from '@mui/icons-material';
import { Divider, Grid, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { Layout, Vector2D } from '@nathaj/simulator';
import { useSnackbar } from 'notistack';
import React, { Touch, useContext, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEnqueueError } from '../../hooks/useEnqueueError';
import { CloseNetwork } from '../../icons/CloseNetwork';
import { SnapToGrid } from '../../icons/SnapToGrid';
import { NetworkContext } from '../../NetworkContext';
import { AddMenu } from '../menus/AddMenu';
import { Canvas } from '../render/Canvas';
import { NetworkDrawer } from '../render/NetworkDrawer';

/**
 * Network renderer component
 */
export const NetworkRenderer: React.FC<{
    setSelected: (name: string | null) => void;
    selected: string | null;
}> = ({ setSelected }) => {
    const network = useContext(NetworkContext);
    const { t } = useTranslation();
    const theme = useTheme();

    const { enqueueSnackbar } = useSnackbar();
    const enqueueError = useEnqueueError();

    const offset = useRef(new Vector2D());
    const mousePos = useRef(new Vector2D());
    const scale = useRef(1);
    const startScale = useRef(1);
    const moved = useRef(false);
    const dragging = useRef(false);
    const panning = useRef(false);
    const dragged = useRef<string | null>(null);

    const [addingLink, setAddingLink] = useState<boolean>(false);
    const [removingLink, setRemovingLink] = useState<boolean>(false);
    const [selectedDev1, setSelectedDev1] = useState<string | null>(null);
    const [removingDevice, setRemovingDevice] = useState<boolean>(false);
    const [showLabel, setShowLabel] = useState(true);
    const [showGrid, setShowGrid] = useState(true);
    const [snapGrid, setSnapGrid] = useState(true);

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

    const GRID_SIZE = scale.current >= 1 ? 25 : scale.current >= 0.3 ? 50 : 100;

    return (
        <Grid container direction='column' flexWrap='nowrap' sx={{ height: '100%' }}>
            <Grid item sx={{ width: '100%' }}>
                <Stack sx={{ padding: '0px 8px', height: '32px' }} direction='row'>
                    <Stack direction='row' flexGrow={1}>
                        <Typography component='h2' variant='h6'>
                            {t('panel.network.title')}
                        </Typography>
                    </Stack>
                    <Stack direction='row'>
                        <AddMenu icon />
                        <Tooltip title={t('panel.network.action.removedev')}>
                            <IconButton
                                size='small'
                                onClick={() => {
                                    allActionsOff();
                                    if (!removingDevice) setRemovingDevice(true);
                                }}>
                                <CloseNetwork color={removingDevice ? 'error' : 'action'} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('panel.network.action.addlink')}>
                            <IconButton
                                size='small'
                                onClick={() => {
                                    allActionsOff();
                                    if (!addingLink) setAddingLink(true);
                                }}>
                                <AddLink color={addingLink ? 'primary' : 'action'} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('panel.network.action.removelink')}>
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
                        <Tooltip title={t('panel.network.action.autolayout')}>
                            <IconButton onClick={() => Layout.spring_layout(network, GRID_SIZE, snapGrid)} size='small'>
                                <Hub />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('panel.network.action.centerview')}>
                            <IconButton onClick={() => (offset.current = new Vector2D(0, 0))} size='small'>
                                <CenterFocusStrong />
                            </IconButton>
                        </Tooltip>
                        <Divider orientation='vertical' />
                        <Tooltip title={t('panel.network.action.labels')}>
                            <IconButton
                                onClick={() => setShowLabel(!showLabel)}
                                size='small'
                                edge='end'
                                color={showLabel ? 'primary' : 'default'}>
                                <Label />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('panel.network.action.snap')}>
                            <IconButton
                                onClick={() => setSnapGrid(!snapGrid)}
                                size='small'
                                edge='end'
                                color={snapGrid ? 'primary' : 'default'}>
                                <SnapToGrid />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('panel.network.action.grid')}>
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

                            mousePos.current = new Vector2D(pointer.pageX, pointer.pageY).div(scale.current);
                            const centerOffset = new Vector2D(e.currentTarget.width, e.currentTarget.height)
                                .mul(-0.5)
                                .div(scale.current);

                            const touch = tmpTouches[0];
                            const page = new Vector2D(touch.pageX, touch.pageY).div(scale.current);
                            // Handle dragging devices
                            for (const dev of network.getDevices()) {
                                if (dev.collision(page.sub(offset.current).add(centerOffset))) {
                                    e.currentTarget.style.cursor = 'grab';
                                    dragging.current = true;
                                    dragged.current = dev.getName();
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
                            mousePos.current = new Vector2D(pointer.pageX, pointer.pageY).div(scale.current);

                            if (dragging.current && dragged.current !== null) {
                                // Drag a device
                                const centerOffset = new Vector2D(e.currentTarget.width, e.currentTarget.height)
                                    .mul(-0.5)
                                    .div(scale.current);

                                e.currentTarget.style.cursor = 'grab';
                                network
                                    .getDevice(dragged.current)
                                    .setPosition(
                                        mousePos.current
                                            .sub(offset.current)
                                            .add(centerOffset)
                                            .align(GRID_SIZE, snapGrid)
                                    );
                                return;
                            }

                            offset.current = offset.current.add(
                                new Vector2D(pointer.pageX - pointer.previousX, pointer.pageY - pointer.previousY).div(
                                    scale.current
                                )
                            );
                        }
                        if (tmpTouches.length === 2) {
                            const a = tmpTouches[0];
                            const b = tmpTouches[1];
                            const startDist = new Vector2D(a.startX, a.startY).dist(new Vector2D(b.startX, b.startY));
                            const currentDist = new Vector2D(a.pageX, a.pageY).dist(new Vector2D(b.pageX, b.pageY));

                            const diff = currentDist - startDist;
                            let tmpScale = startScale.current + diff / 200;
                            if (tmpScale < 0.1) tmpScale = 0.1;
                            if (tmpScale > 4) tmpScale = 4;

                            scale.current = tmpScale;
                        } else {
                            startScale.current = scale.current;
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

                            if (dragging.current && dragged.current !== null) {
                                dragging.current = false;
                                dragged.current = null;
                            }

                            if (start.sqdist(page) < 100) {
                                // We clicked on an element
                                const centerOffset = new Vector2D(e.currentTarget.width, e.currentTarget.height)
                                    .mul(-0.5)
                                    .div(scale.current);

                                // Handle adding or removing links
                                if (addingLink || removingLink) {
                                    for (const dev of network.getDevices()) {
                                        if (
                                            dev.collision(page.div(scale.current).sub(offset.current).add(centerOffset))
                                        ) {
                                            if (selectedDev1 === null) {
                                                setSelectedDev1(dev.getName());
                                            } else {
                                                try {
                                                    if (addingLink) {
                                                        network.addLink(selectedDev1, dev.getName());
                                                        setSelectedDev1(null);
                                                        enqueueSnackbar(t('panel.network.snack.linkadded'));
                                                    } else if (removingLink) {
                                                        network.removeLink(selectedDev1, dev.getName());
                                                        setSelectedDev1(null);
                                                        enqueueSnackbar(t('panel.network.snack.linkremoved'));
                                                    }
                                                } catch (e: any) {
                                                    enqueueError(e);
                                                }
                                            }
                                            return;
                                        }
                                    }
                                }

                                // Handle removing devices
                                if (removingDevice) {
                                    for (const dev of network.getDevices()) {
                                        if (
                                            dev.collision(page.div(scale.current).sub(offset.current).add(centerOffset))
                                        ) {
                                            try {
                                                network.removeDevice(dev.getName());
                                                e.currentTarget.style.cursor = 'default';
                                                enqueueSnackbar(
                                                    t('panel.network.snack.deviceremoved', { name: dev.getName() })
                                                );
                                            } catch (e: any) {
                                                enqueueError(e);
                                            }
                                            return;
                                        }
                                    }
                                }

                                // Handle selecting
                                for (const dev of network.getDevices()) {
                                    if (dev.collision(page.div(scale.current).sub(offset.current).add(centerOffset))) {
                                        setSelected(dev.getName());
                                        dragging.current = false;
                                        dragged.current = null;
                                        return;
                                    }
                                }
                            }
                        }
                        if (tmpTouches.length !== 2) {
                            startScale.current = scale.current;
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
                            .div(scale.current);

                        mousePos.current = new Vector2D(
                            e.pageX - e.currentTarget.getBoundingClientRect().left,
                            e.pageY - e.currentTarget.getBoundingClientRect().top
                        ).div(scale.current);
                        moved.current = false;

                        // Handle adding or removing links
                        if (addingLink || removingLink) {
                            for (const dev of network.getDevices()) {
                                if (dev.collision(mousePos.current.sub(offset.current).add(centerOffset))) {
                                    if (selectedDev1 === null) {
                                        setSelectedDev1(dev.getName());
                                    } else {
                                        try {
                                            if (addingLink) {
                                                network.addLink(selectedDev1, dev.getName());
                                                setSelectedDev1(null);
                                                enqueueSnackbar(t('panel.network.snack.linkadded'));
                                            } else if (removingLink) {
                                                network.removeLink(selectedDev1, dev.getName());
                                                setSelectedDev1(null);
                                                enqueueSnackbar(t('panel.network.snack.linkremoved'));
                                            }
                                        } catch (e: any) {
                                            enqueueError(e);
                                        }
                                    }
                                    return;
                                }
                            }
                        }

                        // Handle removing devices
                        if (removingDevice) {
                            for (const dev of network.getDevices()) {
                                if (dev.collision(mousePos.current.sub(offset.current).add(centerOffset))) {
                                    try {
                                        network.removeDevice(dev.getName());
                                        e.currentTarget.style.cursor = 'default';
                                        enqueueSnackbar(
                                            t('panel.network.snack.deviceremoved', { name: dev.getName() })
                                        );
                                    } catch (e: any) {
                                        enqueueError(e);
                                    }
                                    return;
                                }
                            }
                        }

                        // Handle dragging devices
                        for (const dev of network.getDevices()) {
                            if (dev.collision(mousePos.current.sub(offset.current).add(centerOffset))) {
                                e.currentTarget.style.cursor = 'grab';
                                dragging.current = true;
                                dragged.current = dev.getName();
                                return;
                            }
                        }

                        // Handle panning the view
                        panning.current = true;
                    }}
                    onMouseUp={(e) => {
                        const centerOffset = new Vector2D(e.currentTarget.width, e.currentTarget.height)
                            .div(2)
                            .div(scale.current);

                        if (dragging.current && dragged.current !== null && !moved.current) {
                            setSelected(dragged.current);
                            dragging.current = false;
                            dragged.current = null;
                            return;
                        }

                        mousePos.current = new Vector2D(
                            e.pageX - e.currentTarget.getBoundingClientRect().left,
                            e.pageY - e.currentTarget.getBoundingClientRect().top
                        ).div(scale.current);

                        if (dragging.current && dragged.current !== null) {
                            e.currentTarget.style.cursor = 'pointer';
                            network
                                .getDevice(dragged.current)
                                .setPosition(
                                    mousePos.current.sub(offset.current.add(centerOffset)).align(GRID_SIZE, snapGrid)
                                );
                        } else if (panning.current) {
                            e.currentTarget.style.cursor = 'default';
                        }

                        panning.current = false;
                        dragging.current = false;
                        dragged.current = null;
                    }}
                    onMouseMove={(e) => {
                        const centerOffset = new Vector2D(e.currentTarget.width, e.currentTarget.height)
                            .div(2)
                            .div(scale.current);
                        mousePos.current = new Vector2D(
                            e.pageX - e.currentTarget.getBoundingClientRect().left,
                            e.pageY - e.currentTarget.getBoundingClientRect().top
                        ).div(scale.current);
                        moved.current = true;

                        if (dragging.current && dragged.current !== null) {
                            // Drag a device
                            e.currentTarget.style.cursor = 'grab';
                            network
                                .getDevice(dragged.current)
                                .setPosition(
                                    mousePos.current.sub(offset.current.add(centerOffset)).align(GRID_SIZE, snapGrid)
                                );
                        } else if (panning.current) {
                            // Pan the view
                            e.currentTarget.style.cursor = 'grab';
                            offset.current = offset.current.add(
                                new Vector2D(e.movementX, e.movementY).div(scale.current)
                            );
                        } else {
                            for (const dev of network.getDevices()) {
                                if (dev.collision(mousePos.current.sub(offset.current.add(centerOffset)))) {
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
                            if (scale.current > 0.2) {
                                scale.current = scale.current - 0.1;
                            }
                        } else if (e.deltaY < 0) {
                            if (scale.current < 4) {
                                scale.current = scale.current + 0.1;
                            }
                        }
                    }}
                    draw={(ctx) => {
                        const centerOffset = new Vector2D(ctx.canvas.width, ctx.canvas.height)
                            .div(2)
                            .div(scale.current);
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

                        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                        ctx.scale(scale.current, scale.current);

                        ctx.fillStyle = theme.palette.text.primary;
                        ctx.strokeStyle = theme.palette.text.primary;

                        // Drazw the grid
                        if (showGrid) {
                            for (
                                let i =
                                    (offset.current.x % GRID_SIZE) +
                                    centerOffset.x -
                                    Math.ceil(centerOffset.x / GRID_SIZE) * GRID_SIZE;
                                i < centerOffset.x * 2;
                                i += GRID_SIZE
                            ) {
                                for (
                                    let j =
                                        (offset.current.y % GRID_SIZE) +
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
                                    ctx.moveTo(...dev.getPosition().add(offset.current.add(centerOffset)).array());
                                    ctx.lineTo(
                                        ...(intf
                                            .getConnection()
                                            ?.getOwner()
                                            ?.getPosition()
                                            ?.add(offset.current.add(centerOffset))
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
                            ctx.moveTo(...dev.getPosition().add(offset.current.add(centerOffset)).array());
                            ctx.lineTo(...mousePos.current.array());
                            ctx.stroke();
                            ctx.setLineDash([]);
                        }

                        for (const dev of network.getDevices()) {
                            // If we are in adrk mode, we invert the color of the device
                            ctx.filter = theme.palette.mode === 'dark' ? 'invert(1)' : 'none';
                            // Draw the devices
                            NetworkDrawer.drawDevice(ctx, dev, offset.current.add(centerOffset));
                            ctx.filter = 'none';

                            // And their labels
                            ctx.setTransform(1, 0, 0, 1, 0, 0);
                            if (showLabel) {
                                const text = dev.getText();
                                showText(
                                    text,
                                    dev
                                        .getPosition()
                                        .add(offset.current.add(centerOffset))
                                        .add(new Vector2D(0, -24))
                                        .mul(scale.current),
                                    true,
                                    true,
                                    16
                                );
                            } else {
                                if (dev.collision(mousePos.current.sub(offset.current.add(centerOffset)))) {
                                    const text = dev.getText();
                                    showText(
                                        text,
                                        mousePos.current.mul(scale.current).add(new Vector2D(0, -24)),
                                        true,
                                        false,
                                        16
                                    );
                                }
                            }
                            ctx.scale(scale.current, scale.current);
                        }

                        // Draw the top-left info text
                        ctx.setTransform(1, 0, 0, 1, 0, 0);
                        showText(
                            t('panel.network.render.offset', {
                                x: offset.current.x.toFixed(2),
                                y: offset.current.y.toFixed(2),
                            }),
                            new Vector2D(0, 0)
                        );
                        showText(
                            t('panel.network.render.scale', {
                                scale: scale.current.toFixed(2),
                            }),
                            new Vector2D(0, 21)
                        );
                        showText(
                            t('panel.network.render.time', {
                                time: network.time().toFixed(4),
                            }),
                            new Vector2D(0, 42)
                        );
                    }}
                    style={{ width: '100%', height: '100%', borderRadius: '0 0 4px 4px' }}></Canvas>
            </Grid>
        </Grid>
    );
};
