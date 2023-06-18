import { Interface } from "../network/peripherals/Interface";
import { Vector2D } from "./Vector2D";

export abstract class Drawable {
    position: Vector2D = new Vector2D();

    abstract draw(ctx: CanvasRenderingContext2D, offset: Vector2D): void;
    abstract collision(position: Vector2D): boolean;
    abstract getText(): string;

    setPosition(position: Vector2D) {
        this.position.copy(position);
    }

    intfPositionSquare(direction: Vector2D): Vector2D {
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

    intfPositionCircle(direction: Vector2D): Vector2D {
        return direction;
    }

    drawSimpleInterface(ctx: CanvasRenderingContext2D, intf: Interface, devRadius: number, drawPos: Vector2D, direction: Vector2D, color: string = "#00FF00") {
        const intfPos = drawPos.add(direction.mul(devRadius + 5))

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(intfPos.x, intfPos.y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }

    drawInterfaces(ctx: CanvasRenderingContext2D, drawPos: Vector2D, devRadius: number, interfaces: Interface[], intfPosition: (direction: Vector2D) => Vector2D = this.intfPositionCircle, drawIntferface: (ctx: CanvasRenderingContext2D, intf: Interface, devRadius: number, drawPos: Vector2D, direction: Vector2D) => void = this.drawSimpleInterface) {
        for (const intf of interfaces) {
            if (intf.connected_to !== null) {
                const direction = intfPosition(this.position.direction(intf.connected_to.getOwner().position))
                drawIntferface(ctx, intf, devRadius, drawPos, direction);
            }
        }
    }

    drawCircle(ctx: CanvasRenderingContext2D, drawPos: Vector2D, radius: number, color: string = "#000000") {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(drawPos.x, drawPos.y, radius, 0, 2 * Math.PI);
        ctx.fill();
    }

    drawSquareImage(ctx: CanvasRenderingContext2D, drawPos: Vector2D, img: HTMLImageElement, devRadius: number) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(drawPos.x - devRadius, drawPos.y - devRadius, devRadius * 2, devRadius * 2)
        ctx.drawImage(img, drawPos.x - devRadius, drawPos.y - devRadius, 2 * devRadius, 2 * devRadius);
    }
}
