import React from 'react';
import { EditableProperty } from './Property';

export const FloatProperty: React.FC<{
    value: number;
    setValue: (value: number) => void;
    label: string;
    min?: number;
    max?: number;
}> = ({ value, setValue, label, min, max }) => {
    return (
        <EditableProperty
            label={label}
            value={value.toFixed(5)}
            setValue={(v) => setValue(parseFloat(v))}
            validator={(value) => {
                if (isNaN(parseFloat(value))) return false;
                const v = parseFloat(value);
                if (min !== undefined && v < min) return false;
                if (max !== undefined && v > max) return false;
                return true;
            }}
        />
    );
};
