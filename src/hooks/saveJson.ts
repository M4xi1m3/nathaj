export const saveJson = (data: any, filename: string) => {
    const json = JSON.stringify(data);
    const file = new Blob([json], {
        type: 'application/json',
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
