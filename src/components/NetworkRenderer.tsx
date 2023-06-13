
import { useContext, useState } from "react";
import { NetworkContext } from "../NetworkContexxt";
import { Canvas } from "./Canvas";

export const NetworkRenderer: React.FC = () => {
    const network = useContext(NetworkContext);

    const [dragging, setDragging] = useState(false);
    const [panning, setPanning] = useState(false);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);
    const [dragged, setDragged] = useState<string | null>(null);


    return (

        <Canvas onMouseDown={(e) => {
            setMouseX(e.pageX - e.currentTarget.getBoundingClientRect().left);
            setMouseY(e.pageY - e.currentTarget.getBoundingClientRect().top);

            for (const dev of Object.values(network.devices)) {
                if (dev.collision(mouseX - offsetX, mouseY - offsetY)) {
                    e.currentTarget.style.cursor = 'grab';
                    setDragging(true);
                    setDragged(dev.name);
                    return;
                }
            }

            setPanning(true);
        }} onMouseUp={(e) => {
            setMouseX(e.pageX - e.currentTarget.getBoundingClientRect().left);
            setMouseY(e.pageY - e.currentTarget.getBoundingClientRect().top);

            if (dragging && dragged !== null) {
                e.currentTarget.style.cursor = 'pointer';
                network.devices[dragged].x = mouseX - offsetX;
                network.devices[dragged].y = mouseY - offsetY;
            } else if (panning) {
                e.currentTarget.style.cursor = 'pointer';
            }

            setPanning(false);
            setDragging(false);
            setDragged(null);
        }} onMouseMove={(e) => {
            setMouseX(e.pageX - e.currentTarget.getBoundingClientRect().left);
            setMouseY(e.pageY - e.currentTarget.getBoundingClientRect().top);

            if (dragging && dragged !== null) {
                e.currentTarget.style.cursor = 'grab';
                network.devices[dragged].x = mouseX - offsetX;
                network.devices[dragged].y = mouseY - offsetY;
            } else if (panning) {
                e.currentTarget.style.cursor = 'grab';
                setOffsetX(offsetX + e.movementX);
                setOffsetY(offsetY + e.movementY);
            } else {
                for (const dev of Object.values(network.devices)) {
                    if (dev.collision(mouseX - offsetX, mouseY - offsetY)) {
                        e.currentTarget.style.cursor = 'pointer';
                        return;
                    }
                }
                e.currentTarget.style.cursor = 'default';
            }
        }} draw={(ctx, frame) => {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            for (const dev of Object.values(network.devices)) {
                for (const intf of Object.values(dev.interfaces)) {
                    if (intf.connected_to !== null) {
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(dev.x + offsetX, dev.y + offsetY);
                        ctx.lineTo(intf.connected_to.getOwner().x + offsetX, intf.connected_to.getOwner().y + offsetY);
                        ctx.stroke();
                    }
                }
            }

            for (const dev of Object.values(network.devices)) {
                dev.draw(ctx, offsetX, offsetY);

                if (dev.collision(mouseX - offsetX, mouseY - offsetY)) {
                    const text = dev.getText();
                    const HEIGHT = 18;
                    ctx.font = HEIGHT + "px monospace";
                    const { width } = ctx.measureText(text);
                    ctx.fillStyle = "#000000AA"
                    ctx.fillRect(mouseX - 3, mouseY - 20, width + 6, HEIGHT + 3);
                    ctx.fillStyle = "#FFFFFF"
                    ctx.fillText(text, mouseX, mouseY + HEIGHT - 20);
                }
            }

        }} style={{ width: "100%", height: "100%" }}></Canvas>
    )
};
