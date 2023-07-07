import React from 'react';
import { useCanvas } from '../../hooks/useCanvas';

/**
 * Canvas component
 *
 * @param props Properties
 */
export const Canvas: React.FC<
    {
        draw: (ctx: CanvasRenderingContext2D, frame: number) => void;
    } & React.CanvasHTMLAttributes<HTMLCanvasElement>
> = (props: { draw: (ctx: CanvasRenderingContext2D, frame: number) => void }) => {
    const { draw, ...rest } = props;
    const canvasRef = useCanvas(draw);

    return <canvas ref={canvasRef} {...rest} />;
};
