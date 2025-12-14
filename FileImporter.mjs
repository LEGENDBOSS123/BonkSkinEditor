export class FileImporter {
    static async text() {
        return await new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) {
                    reject('No file selected');
                    return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                    resolve(reader.result);
                };
                reader.onerror = () => {
                    reject('Error reading file');
                };
                reader.readAsText(file);
            };
            input.click();
        });
    }

    static async json() {
        const text = await FileImporter.text();
        return JSON.parse(text);
    }
}