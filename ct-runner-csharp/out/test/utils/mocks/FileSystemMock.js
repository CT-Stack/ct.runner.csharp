"use strict";
class FileSystemMock {
    constructor(content, directoryExists) {
        this.content = content;
        this.directoryExists = directoryExists;
    }
    readDirSync(path) {
        return null;
    }
    readFileSync(filename, encoding) {
        return this.content;
    }
    isDirectory(file) {
        return this.directoryExists;
    }
}
exports.FileSystemMock = FileSystemMock;
//# sourceMappingURL=FileSystemMock.js.map