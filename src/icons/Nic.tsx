import { SvgIcon, SvgIconProps } from '@mui/material';
import React from 'react';

export const Nic: React.FC<SvgIconProps> = (props) => {
    return (
        <SvgIcon {...props}>
            <path d='M2 7H4.5V17H3V8.5H2M22 7V16H14V17H7V16H6V7M10 9H8V12H10M13 9H11V12H13M20 9H15V14H20V9Z' />
        </SvgIcon>
    );
};