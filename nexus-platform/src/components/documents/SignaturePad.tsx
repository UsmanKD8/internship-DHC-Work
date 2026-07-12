import React, { useRef, useState } from 'react';
import { Button } from '../ui/Button';

interface Props {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

// Lightweight canvas signature pad — no external deps
export const SignaturePad: React.FC<Props> = ({ onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const getCtx = () => canvasRef.current?.getContext('2d');

  const pos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const point = 'touches' in e ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    drawing.current = true;
    setIsEmpty(false);
    const { x, y } = pos(e);
    const ctx = getCtx();
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    const { x, y } = pos(e);
    const ctx = getCtx();
    if (ctx) {
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#1E3A8A';
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const end = () => (drawing.current = false);

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const save = () => {
    if (canvasRef.current) onSave(canvasRef.current.toDataURL('image/png'));
  };

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        width={480}
        height={160}
        className="border border-dashed border-gray-300 rounded-md w-full bg-gray-50 touch-none cursor-crosshair"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      <p className="text-xs text-gray-500">Sign above using mouse or touch</p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={clear}>Clear</Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" disabled={isEmpty} onClick={save}>Save Signature</Button>
      </div>
    </div>
  );
};
