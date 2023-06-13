
export abstract class Drawable {
    x: number = 0;
    y: number = 0;

    abstract draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number): void;
    abstract collision(x: number, y: number): boolean;
    abstract getText(): string;

    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
