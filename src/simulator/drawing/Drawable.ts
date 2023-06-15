import { Vector2D } from "./Vector2D";

export abstract class Drawable {
    position: Vector2D = new Vector2D();

    abstract draw(ctx: CanvasRenderingContext2D, offset: Vector2D): void;
    abstract collision(position: Vector2D): boolean;
    abstract getText(): string;

    setPosition(position: Vector2D) {
        this.position.copy(position);
    }
}
