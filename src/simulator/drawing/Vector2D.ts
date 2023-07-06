/**
 * Two-dimmensionnal vector class
 */
export class Vector2D {
    /**
     * X component
     */
    public x: number;

    /**
     * Y component
     */
    public y: number;

    /**
     * Create a vector
     * @param {number} [x=0] X value
     * @param {number} [y=0] Y value
     */
    public constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Copy another vector to this vector
     *
     * @param {Vector2D} other Vector to copy
     */
    public copy(other: Vector2D) {
        this.x = other.x;
        this.y = other.y;
    }

    /**
     * Add another vector and return the result
     *
     * @param {Vector2D} other Vector to add
     * @returns {Vector2D} Result of the addition
     */
    public add(other: Vector2D) {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }

    /**
     * Substract another vector and return the result
     *
     * @param {Vector2D} other Vector to substract
     * @returns {Vector2D} Result of the substraction
     */
    public sub(other: Vector2D) {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }

    /**
     * Divide the vector by a scalar and return the result
     *
     * @param {number} a Number to divide with
     * @returns {Vector2D} Result of the division
     */
    public div(a: number) {
        return new Vector2D(this.x / a, this.y / a);
    }

    /**
     * Multiply the vector by a scalar and return the result
     *
     * @param {number} a Number to multiply with
     * @returns {Vector2D} Result of the multiplication
     */
    public mul(a: number) {
        return new Vector2D(this.x * a, this.y * a);
    }

    /**
     * Get the length of the vector
     *
     * @returns {number} Length of the vector
     */
    public length(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    /**
     * Get the square length of the vector
     *
     * @returns {number} Square length of the vector
     */
    public sqlength(): number {
        return Math.pow(this.x, 2) + Math.pow(this.y, 2);
    }

    /**
     * Get the distance between this and an other vector
     *
     * @param {Vector2D} other Vector to measure the distance of
     * @returns {number} Distance between the two vectors
     */
    public dist(other: Vector2D) {
        return this.sub(other).length();
    }

    /**
     * Get the square distance between this and an other vector
     *
     * @param {Vector2D} other Vector to measure the distance of
     * @returns {number} Square distance between the two vectors
     */
    public sqdist(other: Vector2D) {
        return this.sub(other).sqlength();
    }

    /**
     * Normalize the vector
     *
     * @returns {Vector2D} Normalized vector
     */
    public normalize() {
        if (this.length() === 0) return new Vector2D();
        return this.div(this.length());
    }

    /**
     * Get the direction between this vector and another vector
     *
     * @param {Vector2D} other Vector to get the direciton to
     * @returns {Vector2D} Direction to the other vector (normalized)
     */
    public direction(other: Vector2D) {
        return other.sub(this).normalize();
    }

    /**
     * Get the vector as a [x,y] array
     * @returns {[number,number]} Vector as an array
     */
    public array(): [number, number] {
        return [this.x, this.y];
    }

    public align(grid_size: number, doAlign = true) {
        if (doAlign)
            return new Vector2D(Math.round(this.x / grid_size) * grid_size, Math.round(this.y / grid_size) * grid_size);
        else return this;
    }
}
