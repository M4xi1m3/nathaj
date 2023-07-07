import { SvgIcon, SvgIconProps } from '@mui/material';
import React from 'react';

export const NicPlus: React.FC<SvgIconProps> = (props) => {
    return (
        <SvgIcon {...props}>
            <path d='M 2 7 L 2 8.5 L 3 8.5 L 3 17 L 4.5 17 L 4.5 7 L 2 7 z M 6 7 L 6 16 L 7 16 L 7 17 L 12.105469 17 A 5.9936075 5.9936075 0 0 1 15 12.828125 L 15 9 L 20 9 L 20 12.361328 A 5.9936075 5.9936075 0 0 1 22 13.546875 L 22 7 L 6 7 z M 8 9 L 10 9 L 10 12 L 8 12 L 8 9 z M 11 9 L 13 9 L 13 12 L 11 12 L 11 9 z ' />
            <path d='m 17,14 v 3 h -3 v 2 h 3 v 3 h 2 v -3 h 3 v -2 h -3 v -3' />
        </SvgIcon>
    );
};
