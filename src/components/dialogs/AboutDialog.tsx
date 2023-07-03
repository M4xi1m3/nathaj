import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, Typography } from '@mui/material';
import React from 'react';
import { ReactComponent as LogoLight } from '../../assets/logo/logo.svg';

import packageJson from '../../../package.json';

interface AboutDialogProps {
    close: () => void;
    opened: boolean;
}

const LogoPart: React.FC = () => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '240px',
            justifyContent: 'end',
        }}>
        <LogoLight style={{ width: '128px', marginRight: '16px', height: '128px' }} />
        <Typography sx={{ marginBottom: '24px', fontFamily: 'Righteous' }} variant='h5' color='text.secondary'>
            Näthaj {packageJson.version}
        </Typography>
        <Typography gutterBottom variant='body2' sx={{ marginBottom: '24px' }}>
            {packageJson.description}
        </Typography>
    </Box>
);

export const AboutDialog: React.FC<AboutDialogProps> = ({ opened, close }) => {
    return (
        <Dialog open={opened} onClose={() => close()} maxWidth='sm' fullWidth={true}>
            <DialogTitle>About</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', paddingBottom: 0 }}>
                <LogoPart />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'end',
                        flexGrow: 1,
                    }}>
                    <Typography gutterBottom variant='caption' sx={{ textAlign: 'center' }}>
                        {'Copyright © 2023 '}
                        {packageJson.author.name}
                        {packageJson.contributors.length > 0 ? ' et al.' : ''}
                        <br />
                        Näthaj is released under the terms of the{' '}
                        <Link href='/COPYING'>GNU General Public License Affero version 3</Link>.<br />A copy of the
                        source code is available <Link href={packageJson.repository.url}>here</Link>.
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ paddingTop: 0 }}>
                <Button onClick={() => close()}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};
