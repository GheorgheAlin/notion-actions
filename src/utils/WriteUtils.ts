const fs = require('fs');

export class WriteUtils {
    public static writeJson(
        data: Object,
        fileName: string
    ): void {
        fs.writeFileSync(fileName, data);
    }
}