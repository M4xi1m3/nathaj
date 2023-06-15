
export class Vector2D {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    copy(other: Vector2D) {
        this.x = other.x;
        this.y = other.y;
    }

    add(other: Vector2D) {
        return new Vector2D(
            this.x + other.x,
            this.y + other.y
        )
    }

    sub(other: Vector2D) {
        return new Vector2D(
            this.x - other.x,
            this.y - other.y
        )
    }

    div(a: number) {
        return new Vector2D(
            this.x / a,
            this.y / a
        )
    }

    mul(a: number) {
        return new Vector2D(
            this.x * a,
            this.y * a
        )
    }

    length(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    sqlength(): number {
        return Math.pow(this.x, 2) + Math.pow(this.y, 2);
    }

    dist(other: Vector2D) {
        return this.sub(other).length()
    }

    sqdist(other: Vector2D) {
        return this.sub(other).sqlength()
    }

    normalize() {
        if (this.length() === 0)
            return new Vector2D()
        return this.div(this.length());
    }

    direction(other: Vector2D) {
        return other.sub(this).normalize();
    }

    array(): [number, number] {
        return [this.x, this.y];
    }
}
