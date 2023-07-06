import { Interface } from '../network/peripherals/Interface';
import { Vector2D } from './Vector2D';

/**
 * Represents something that can be drawn
 */
export abstract class Drawable<T extends Interface = Interface> {
    /**
     * Position of the drawable object
     */
    private position: Vector2D = new Vector2D();

    /**
     * Draw the object
     *
     * @param {CanvasRenderingContext2D} ctx Canvas context to draw the object
     * @param {Vector2D} offset Offset to apply to the position before drawing
     */
    public abstract draw(ctx: CanvasRenderingContext2D, offset: Vector2D): void;

    /**
     * Check for collision between the object and a point
     *
     * @param {Vector2D} position Point to check for collision with
     */
    public abstract collision(position: Vector2D): boolean;

    /**
     * Get the text to display ontop of the object if hovered
     */
    public abstract getText(): string;

    /**
     * Get the position of the object
     *
     * @returns {Vector2D} Position of the object
     */
    public getPosition(): Vector2D {
        return new Vector2D(this.position.x, this.position.y);
    }

    /**
     * Set the position of the object
     * @param {Vectod2D} position New position of the object
     */
    public setPosition(position: Vector2D) {
        this.position.copy(position);
    }

    /**
     * Calculate position of an interface arround a square object
     * @param {Vector2D} direction Direction vector
     * @returns {Vector2D} Interface position
     */
    protected intfPositionSquare(direction: Vector2D): Vector2D {
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
    protected intfPositionCircle(direction: Vector2D): Vector2D {
        return direction;
    }

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
    protected drawSimpleInterface(
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
    protected drawInterfaces(
        ctx: CanvasRenderingContext2D,
        drawPos: Vector2D,
        devRadius: number,
        interfaces: T[],
        intfPosition: (direction: Vector2D) => Vector2D = this.intfPositionCircle,
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
                    this.position.direction(intf.getConnection()?.getOwner()?.position ?? new Vector2D())
                );
                drawIntferface(ctx, intf, devRadius, drawPos, direction);
            }
        }
    }

    /**
     * Draw a circle device
     * @param {CanvasRenderingContext2D} ctx Canvas context used to draw
     * @param {Vector2D} drawPos Position to draw the device at
     * @param {number} radius Radius of the circle
     * @param {string} color Color of the circle
     */
    protected drawCircle(ctx: CanvasRenderingContext2D, drawPos: Vector2D, radius: number, color = '#000000') {
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
    protected drawSquareImage(
        ctx: CanvasRenderingContext2D,
        drawPos: Vector2D,
        img: HTMLImageElement,
        devRadius: number
    ) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(drawPos.x - devRadius, drawPos.y - devRadius, devRadius * 2, devRadius * 2);
        ctx.drawImage(img, drawPos.x - devRadius, drawPos.y - devRadius, 2 * devRadius, 2 * devRadius);
    }
}
