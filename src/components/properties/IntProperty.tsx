import React from 'react';
import { EditableProperty } from './Property';

export const IntProperty: React.FC<{
    value: number;
    setValue: (value: number) => void;
    label: string;
    min?: number;
    max?: number;
}> = ({ value, setValue, label, min, max }) => {
    return (
        <EditableProperty
            label={label}
            value={value.toString()}
            setValue={(v) => setValue(parseInt(v))}
            validator={(value) => {
                if (isNaN(parseInt(value))) return false;
                const v = parseInt(value);
                if (min !== undefined && v < min) return false;
                if (max !== undefined && v > max) return false;
                return true;
            }}
        />
    );
};
