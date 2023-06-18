import { Network } from "../network/Network";
import { Vector2D } from "./Vector2D";

export class Layout {
    static spring_layout(net: Network) {
        Layout.random(net);
        Layout.fruchterman_reingold(net);
        Layout.re_center(net);
    }

    static random(net: Network, minX: number = -100, maxX: number = 100, minY: number = -100, maxY: number = 100) {
        Object.values(net.devices).forEach((dev) => {
            dev.position.x = Math.random() * (maxX - minX) + minX;
            dev.position.y = Math.random() * (maxY - minY) + minY;
        });
    }

    static re_center(net: Network, at: Vector2D = new Vector2D()) {
        let avg = new Vector2D();
        let count = 0;

        Object.values(net.devices).forEach((dev) => {
            avg = avg.add(dev.position)
            count++;
        });

        const diff = avg.div(count).sub(at)

        Object.values(net.devices).forEach((dev) => {
            dev.position = dev.position.sub(diff);
        });
    }

    static fruchterman_reingold(net: Network, epsilon: number = 0.01, max_iter: number = 1000, ideal_length: number = 100, cooling_factor: number = 0.99): void {
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

            Object.entries(net.devices).forEach(([u_name, u_dev]) => {
                forces[u_name] = new Vector2D();

                // Calculate repulsive forces
                Object.entries(net.devices).forEach(([v_name, v_dev]) => {
                    if (u_dev === v_dev)
                        return
                    forces[u_name] = forces[u_name].add(repulsive_force(u_dev.position, v_dev.position));
                });

                // Calculate attractives forces
                Object.values(u_dev.interfaces).map((intf) => intf.connected_to?.owner).forEach((v_dev) => {
                    if (v_dev === undefined)
                        return
                    if (u_dev === v_dev)
                        return

                    forces[u_name] = forces[u_name].add(attractive_force(u_dev.position, v_dev.position));
                });
            });

            // Apply forces
            for (const [u_name, u_dev] of Object.entries(net.devices)) {
                if (Number.isNaN(forces[u_name].x) || Number.isNaN(forces[u_name].y))
                    return

                forces[u_name] = apply_temperature(forces[u_name], temp);
                max_force = Math.max(max_force, forces[u_name].length());
                u_dev.position = u_dev.position.add(forces[u_name]);
            }

            // Cool the system
            temp *= cooling_factor;
        }
    }
}

