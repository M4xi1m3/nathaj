export const saveBin = (data: ArrayBuffer, filename: string, type = 'application/octet-stream') => {
    const file = new Blob([data], {
        type,
    });

    const a = document.createElement('a');
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
};