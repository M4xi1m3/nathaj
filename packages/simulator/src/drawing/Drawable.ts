import { Vector2D } from './Vector2D';

/**
 * Represents something that can be drawn
 */
export abstract class Drawable {
    /**
     * Position of the drawable object
     */
    private position: Vector2D = new Vector2D();

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
}
