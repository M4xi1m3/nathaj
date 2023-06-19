import { useRef, useEffect } from 'react';

export const useCanvas = (draw: (ctx: CanvasRenderingContext2D, frame: number) => void) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        let frameCount = 0;
        let animationFrameId: number;

        const resizeCanvasToDisplaySize = (canvas: HTMLCanvasElement) => {
            const { width, height } = canvas.getBoundingClientRect();

            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
                return true;
            }

            return false;
        };

        const render = () => {
            frameCount++;
            if (canvas !== null) resizeCanvasToDisplaySize(canvas);
            if (context !== null && context !== undefined) draw(context, frameCount);
            animationFrameId = window.requestAnimationFrame(render);
        };
        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [draw]);

    return canvasRef;
};
