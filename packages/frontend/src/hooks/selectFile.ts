/**
 * Select file(s).
 *
 * @param {string} contentType The content type of files you wish to select. For instance, use "image/*" to select all types of images.
 * @param {boolean} multiple Indicates if the user can select multiple files.
 * @returns {Promise<File|File[]>} A promise of a file or array of files in case the multiple parameter is true.
 */
export function selectFile(contentType: string, multiple: boolean): Promise<File | File[]> {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = multiple;
        input.accept = contentType;

        input.onchange = () => {
            if (input.files === null) return;

            const files = Array.from(input.files);
            if (multiple) resolve(files);
            else resolve(files[0]);
        };

        input.click();
    });
}
