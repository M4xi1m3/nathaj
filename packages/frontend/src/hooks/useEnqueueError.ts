import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

export const useEnqueueError = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation();

    return (e: any) => {
        if (e instanceof Error) {
            if ('i18n' in e && 'i18nargs' in e && typeof e.i18n === 'string') {
                enqueueSnackbar(t(e.i18n, e.i18nargs), { variant: 'error' });
            } else {
                enqueueSnackbar(e.message, { variant: 'error' });
                console.error("Exception doesn't have a translation !");
                console.error(e);
            }
        } else {
            enqueueSnackbar('Unknown error', { variant: 'error' });
        }
    };
};
