import HubImg from '../../assets/hub.png';
import STPSwitchImg from '../../assets/stp-switch.png';
import SwitchImg from '../../assets/switch.png';
import { Vector2D } from '../../simulator/drawing/Vector2D';
import { Device } from '../../simulator/network/peripherals/Device';
import { Host } from '../../simulator/network/peripherals/Host';
import { Hub } from '../../simulator/network/peripherals/Hub';
import { Interface } from '../../simulator/network/peripherals/Interface';
import { PortRole, PortState, STPInterface, STPSwitch } from '../../simulator/network/peripherals/STPSwitch';
import { Switch } from '../../simulator/network/peripherals/Switch';

const HubImage = new Image();
HubImage.src = HubImg;

const SwitchImage = new Image();
SwitchImage.src = SwitchImg;

const STPSwitchImage = new Image();
STPSwitchImage.src = STPSwitchImg;

export class NetworkDrawer {
    /**
     * Draw a simple interface (a dot)
     *
     * @param {CanvasRenderingContext2D} ctx Canvas context used to draw
     * @param {Interface} intf Interface to draw
     * @param {number} devRadius Radius of the device to draw the interface on
     * @param {Vector2D} drawPos Draw position of the device
     * @param {Vector2D} direction Direction at which to put the interface
     * @param {string} color Color of the interface
     */
    private static drawSimpleInterface<T extends Interface = Interface>(
        ctx: CanvasRenderingContext2D,
        intf: T,
        devRadius: number,
        drawPos: Vector2D,
        direction: Vector2D,
        color = '#00DD00'
    ) {
        const intfPos = drawPos.add(direction.mul(devRadius + 5));

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(intfPos.x, intfPos.y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }

    /**
     * Draw all of a device's interface
     *
     * @typedef {(direction: Vector2D) => Vector2D} DirectionFunction
     * @typedef {(ctx: CanvasRenderingContext2D, intf: Interface, devRadius: number, drawPos: Vector2D, direction: Vector2D) => void} DrawInterfaceFunction
     *
     * @param {CanvasRenderingContext2D} ctx Canvas context used to draw
     * @param {Vector2D} drawPos Position of the device to draw the interfaces of
     * @param {number} devRadius Radius of the device
     * @param {Interface[]} interfaces Interfaces to draw
     * @param {DirectionFunction} [intfPosition] Function used to determine the direction of the interfaces
     * @param {DrawInterfaceFunction} [drawIntferface] Function used to draw the interfaces
     */
    private static drawInterfaces<T extends Interface = Interface>(
        ctx: CanvasRenderingContext2D,
        device: Device,
        drawPos: Vector2D,
        devRadius: number,
        interfaces: T[],
        intfPosition: (direction: Vector2D) => Vector2D = NetworkDrawer.intfPositionCircle,
        drawIntferface: (
            ctx: CanvasRenderingContext2D,
            intf: T,
            devRadius: number,
            drawPos: Vector2D,
            direction: Vector2D
        ) => void = this.drawSimpleInterface
    ) {
        for (const intf of interfaces) {
            if (intf.getConnection() !== null) {
                const direction = intfPosition(
                    device.getPosition().direction(intf.getConnection()?.getOwner()?.getPosition() ?? new Vector2D())
                );
                drawIntferface(ctx, intf, devRadius, drawPos, direction);
            }
        }
    }

    /**
     * Draw an STP interface
     *
     * @param {CanvasRenderingContext2D} ctx Canvas context used to draw
     * @param {STPInterface} intf Interface to draw
     * @param {number} devRadius Radius of the device to draw the interface on
     * @param {Vector2D} drawPos Draw position of the device
     * @param {Vector2D} direction Direction at which to put the interface
     * @param {string} color Color of the interface
     */
    private static drawSTPInterface(
        ctx: CanvasRenderingContext2D,
        intf: STPInterface,
        devRadius: number,
        drawPos: Vector2D,
        direction: Vector2D
    ) {
        const intfPos = drawPos.add(direction.mul(devRadius + 5));

        switch (intf.role) {
            case PortRole.Disabled:
                ctx.fillStyle = '#DD0000';
                break;
            case PortRole.Blocking:
                ctx.fillStyle = '#DDDD00';
                break;
            case PortRole.Root:
                ctx.fillStyle = '#0000DD';
                break;
            case PortRole.Designated:
                ctx.fillStyle = '#00DD00';
                break;
        }

        ctx.beginPath();
        ctx.arc(intfPos.x, intfPos.y, 5, 0.24 * Math.PI, 1.26 * Math.PI);
        ctx.fill();

        switch (intf.state) {
            case PortState.Disabled:
                ctx.fillStyle = '#DD0000';
                break;
            case PortState.Blocking:
                ctx.fillStyle = '#DDDD00';
                break;
            case PortState.Listening:
                ctx.fillStyle = '#6666DD';
                break;
            case PortState.Learning:
                ctx.fillStyle = '#66DDDD';
                break;
            case PortState.Forwarding:
                ctx.fillStyle = '#00DD00';
                break;
        }

        ctx.beginPath();
        ctx.arc(intfPos.x, intfPos.y, 5, 1.25 * Math.PI, 0.25 * Math.PI);
        ctx.fill();
    }

    /**
     * Draw a circle device
     * @param {CanvasRenderingContext2D} ctx Canvas context used to draw
     * @param {Vector2D} drawPos Position to draw the device at
     * @param {number} radius Radius of the circle
     * @param {string} color Color of the circle
     */
    private static drawCircle(ctx: CanvasRenderingContext2D, drawPos: Vector2D, radius: number, color = '#000000') {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(drawPos.x, drawPos.y, radius, 0, 2 * Math.PI);
        ctx.fill();
    }

    /**
     * Draw a square image device
     * @param {CanvasRenderingContext2D} ctx Canvas context used to draw
     * @param {Vector2D} drawPos Position to draw the device at
     * @param {HTMLImageElement} img Image to draw
     * @param {number} devRadius Radius of the circle
     */
    private static drawSquareImage(
        ctx: CanvasRenderingContext2D,
        drawPos: Vector2D,
        img: HTMLImageElement,
        devRadius: number
    ) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(drawPos.x - devRadius, drawPos.y - devRadius, devRadius * 2, devRadius * 2);
        ctx.drawImage(img, drawPos.x - devRadius, drawPos.y - devRadius, 2 * devRadius, 2 * devRadius);
    }

    /**
     * Calculate position of an interface arround a square object
     * @param {Vector2D} direction Direction vector
     * @returns {Vector2D} Interface position
     */
    public static intfPositionSquare(direction: Vector2D): Vector2D {
        if (Math.abs(direction.x) > Math.abs(direction.y)) {
            const tan = direction.y / direction.x;
            direction.y = direction.x > 0 ? tan : -tan;
            direction.x = direction.x > 0 ? 1 : -1;
        } else {
            const tan = direction.x / direction.y;
            direction.y = direction.y > 0 ? 1 : -1;
            direction.x = direction.y > 0 ? tan : -tan;
        }
        return direction;
    }

    /**
     * Calculate position of an interface arround a circular object
     * @param {Vector2D} direction Direction vector
     * @returns {Vector2D} Interface position
     */
    public static intfPositionCircle(direction: Vector2D): Vector2D {
        return direction;
    }

    private static drawHost(ctx: CanvasRenderingContext2D, host: Host, offset: Vector2D): void {
        NetworkDrawer.drawCircle(ctx, host.getPosition().add(offset), 7);
        const old = ctx.filter;
        ctx.filter = 'none';
        NetworkDrawer.drawInterfaces(ctx, host, host.getPosition().add(offset), 7, host.getInterfaces());
        ctx.filter = old;
    }

    private static drawHub(ctx: CanvasRenderingContext2D, hub: Hub, offset: Vector2D): void {
        NetworkDrawer.drawSquareImage(ctx, hub.getPosition().add(offset), HubImage, 12);
        const old = ctx.filter;
        ctx.filter = 'none';
        NetworkDrawer.drawInterfaces(
            ctx,
            hub,
            hub.getPosition().add(offset),
            12,
            hub.getInterfaces(),
            NetworkDrawer.intfPositionSquare
        );
        ctx.filter = old;
    }

    private static drawSwitch(ctx: CanvasRenderingContext2D, sw: Switch, offset: Vector2D): void {
        NetworkDrawer.drawSquareImage(ctx, sw.getPosition().add(offset), SwitchImage, 12);
        const old = ctx.filter;
        ctx.filter = 'none';
        NetworkDrawer.drawInterfaces(
            ctx,
            sw,
            sw.getPosition().add(offset),
            12,
            sw.getInterfaces(),
            NetworkDrawer.intfPositionSquare
        );
        ctx.filter = old;
    }

    private static drawStpSwitch(ctx: CanvasRenderingContext2D, sw: STPSwitch, offset: Vector2D): void {
        NetworkDrawer.drawSquareImage(ctx, sw.getPosition().add(offset), STPSwitchImage, 12);
        const old = ctx.filter;
        ctx.filter = 'none';
        NetworkDrawer.drawInterfaces(
            ctx,
            sw,
            sw.getPosition().add(offset),
            12,
            sw.getInterfaces(),
            NetworkDrawer.intfPositionSquare,
            NetworkDrawer.drawSTPInterface
        );
        ctx.filter = old;
    }

    /**
     * Draw a device
     *
     * @param {CanvasRenderingContext2D} ctx Canvas context to draw the object
     * @param {Device} dev Device to  draw
     * @param {Vector2D} offset Offset to apply to the position before drawing
     */
    public static drawDevice(ctx: CanvasRenderingContext2D, dev: Device, offset: Vector2D): void {
        if (dev instanceof Host) NetworkDrawer.drawHost(ctx, dev, offset);
        else if (dev instanceof STPSwitch) NetworkDrawer.drawStpSwitch(ctx, dev, offset);
        else if (dev instanceof Switch) NetworkDrawer.drawSwitch(ctx, dev, offset);
        else if (dev instanceof Hub) NetworkDrawer.drawHub(ctx, dev, offset);
    }
}
