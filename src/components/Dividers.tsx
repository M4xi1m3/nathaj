import styled from '@emotion/styled';
import { Height } from '@mui/icons-material';
import { Divider, DividerProps, dividerClasses } from '@mui/material';
import React from 'react';
import { PanelResizeHandle } from 'react-resizable-panels';

const StyledDivider = styled((props: DividerProps) => <Divider {...props} />)(() => ({
    [`& .${dividerClasses.wrapper}`]: {
        padding: 0,
    },
    [`& .${dividerClasses.wrapperVertical}`]: {
        padding: 0,
    },
}));

/**
 * Vertical divider, to be used between Panels
 */
export const VerticalDivider: React.FC = () => (
    <PanelResizeHandle>
        <StyledDivider orientation='vertical'>
            <Height sx={{ transform: 'rotate(90deg)', fontSize: '16px' }} htmlColor='rgba(0,0,0,0.5)' />
        </StyledDivider>
    </PanelResizeHandle>
);

/**
 * Horizontal divider, to be used between Panels
 */
export const HorizontalDivider: React.FC = () => (
    <PanelResizeHandle>
        <StyledDivider orientation='horizontal'>
            <Height sx={{ fontSize: '16px' }} htmlColor='rgba(0,0,0,0.5)' />
        </StyledDivider>
    </PanelResizeHandle>
);
