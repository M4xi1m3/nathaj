import { ExpandMore } from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionDetailsProps,
    AccordionProps,
    AccordionSummary,
    AccordionSummaryProps,
    Stack,
    styled,
} from '@mui/material';
import React from 'react';

export const PropAccordion: React.FC<AccordionProps> = styled((props: AccordionProps) => (
    <Accordion
        TransitionProps={{ unmountOnExit: true }}
        disableGutters
        elevation={0}
        defaultExpanded
        square
        {...props}
    />
))(() => ({}));

export const PropAccordionSummary: React.FC<AccordionSummaryProps> = styled(
    ({ children, ...props }: AccordionSummaryProps) => (
        <AccordionSummary expandIcon={<ExpandMore />} {...props}>
            <Stack
                direction='row'
                justifyContent='center'
                sx={{ width: '100%', cursor: 'default' }}
                onClick={(e) => e.stopPropagation()}>
                {children}
            </Stack>
        </AccordionSummary>
    )
)(() => ({
    flexDirection: 'row-reverse',
    paddingRight: '4px',
    paddingLeft: '4px',
    minHeight: 0,
    '& .MuiAccordionSummary-content': {
        margin: 0,
        '&.Mui-expanded': {
            margin: 0,
        },
    },
    '&.Mui-expanded': {
        minHeight: 0,
    },
}));

export const PropAccordionDetails: React.FC<AccordionDetailsProps> = styled((props: AccordionDetailsProps) => (
    <AccordionDetails {...props} />
))(() => ({
    padding: 0,
}));
