import styled from '@emotion/styled';
import { DragIndicator } from '@mui/icons-material';
import { Divider, dividerClasses, DividerProps, useTheme } from '@mui/material';
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
export const VerticalDivider: React.FC = () => {
    const theme = useTheme();

    return (
        <PanelResizeHandle style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <DragIndicator sx={{ fontSize: '16px' }} htmlColor={theme.palette.text.secondary} />
        </PanelResizeHandle>
    );
};

/**
 * Horizontal divider, to be used between Panels
 */
export const HorizontalDivider: React.FC = () => {
    const theme = useTheme();

    return (
        <PanelResizeHandle style={{ display: 'flex', justifyContent: 'center' }}>
            <DragIndicator
                sx={{ transform: 'rotate(90deg)', fontSize: '16px' }}
                htmlColor={theme.palette.text.secondary}
            />
        </PanelResizeHandle>
    );
};
