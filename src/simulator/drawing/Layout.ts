import { Network } from "../network/Network";
import { Vector2D } from "./Vector2D";

/**
 * Class with static method used to lay out the network graph for sdrawing
 */
export class Layout {
    /**
     * Aclaulate a sping layout using Fruchterman-Reingold's algorythm.
     * 
     * @param {Network} net Network tu run the spring layout on
     */
    static spring_layout(net: Network) {
        Layout.random(net);
        Layout.fruchterman_reingold(net);
        Layout.re_center(net);
    }

    /**
     * Randomize the network devices' position
     * @param {Network} net Network to randomize the devices' positions of
     * @param {number} [minX] Minimum X value
     * @param {number} [maxX] Maximum X value
     * @param {number} [minY] Minimum Y value
     * @param {number} [maxY] Maximum Y value
     */
    private static random(net: Network, minX: number = -100, maxX: number = 100, minY: number = -100, maxY: number = 100) {
        net.getDevices().forEach((dev) => {
            dev.setPosition(new Vector2D(
                Math.random() * (maxX - minX) + minX,
                Math.random() * (maxY - minY) + minY
            ));
        });
    }

    /**
     * Move the network topology to a fixed point
     * 
     * @param {Network} net Network to move
     * @param {Vector2D} [at] New average of the network's positions
     */
    private static re_center(net: Network, at: Vector2D = new Vector2D()) {
        let avg = new Vector2D();
        let count = 0;

        net.getDevices().forEach((dev) => {
            avg = avg.add(dev.getPosition());
            count++;
        });

        const diff = avg.div(count).sub(at)

        net.getDevices().forEach((dev) => {
            dev.setPosition(dev.getPosition().sub(diff));
        });
    }

    /**
     * Fruchterman-Reingold's algorythm
     * 
     * @see {https://onlinelibrary.wiley.com/doi/10.1002/spe.4380211102}
     * 
     * @param {Network} net Network to run the algorythm on
     * @param {number} [epsilon] Epsilon value used to stop the algorythm
     * @param {number} [max_iter] Maximum number of iterations
     * @param {number} [ideal_length] Ideal length of the links
     * @param {number} [cooling_factor] Cooling factor of the system
     */
     private static fruchterman_reingold(net: Network, epsilon: number = 0.01, max_iter: number = 1000, ideal_length: number = 100, cooling_factor: number = 0.99): void {
        Layout.random(net);
        let iter = 0; // Iteration count
        let max_force = 1000; // Maximum force in the system
        let temp = 1; // Temperature of the system

        const forces: { [name: string]: Vector2D } = {};


        const repulsive_force = (u: Vector2D, v: Vector2D): Vector2D => {
            return v.direction(u).mul(Math.pow(ideal_length, 2) / Math.max(u.dist(v), 0.01));
        }
        const attractive_force = (u: Vector2D, v: Vector2D): Vector2D => {
            return u.direction(v).mul(Math.pow(u.dist(v), 2) / ideal_length);
        }
        const apply_temperature = (force: Vector2D, temp: number) => {
            return force.normalize().div(force.length()).mul(Math.min(force.length(), temp * ideal_length * 2))
        }

        while (iter < max_iter && max_force > epsilon) {
            max_force = 0;
            iter++;

            net.getDevices().forEach((u_dev) => {
                forces[u_dev.getName()] = new Vector2D();

                // Calculate repulsive forces
                net.getDevices().forEach((v_dev) => {
                    if (u_dev === v_dev)
                        return
                    forces[u_dev.getName()] = forces[u_dev.getName()].add(repulsive_force(u_dev.getPosition(), v_dev.getPosition()));
                });

                // Calculate attractives forces
                u_dev.getInterfaces().map((intf) => intf.getConnection()?.getOwner()).forEach((v_dev) => {
                    if (v_dev === undefined)
                        return
                    if (u_dev === v_dev)
                        return

                    forces[u_dev.getName()] = forces[u_dev.getName()].add(attractive_force(u_dev.getPosition(), v_dev.getPosition()));
                });
            });

            // Apply forces
            for (const u_dev of net.getDevices()) {
                if (Number.isNaN(forces[u_dev.getName()].x) || Number.isNaN(forces[u_dev.getName()].y))
                    return

                forces[u_dev.getName()] = apply_temperature(forces[u_dev.getName()], temp);
                max_force = Math.max(max_force, forces[u_dev.getName()].length());
                u_dev.setPosition(u_dev.getPosition().add(forces[u_dev.getName()]));
            }

            // Cool the system
            temp *= cooling_factor;
        }
    }
}

