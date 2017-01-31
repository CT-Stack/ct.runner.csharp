"use strict";
class FileSystemMock {
    constructor(content, directoryExists, readDirs, isDirectoryFunction) {
        this.content = content;
        this.directoryExists = directoryExists;
        this.readDirs = readDirs;
        this.isDirectoryFunction = isDirectoryFunction;
    }
    readDirSync(path) {
        return this.readDirs;
    }
    readFileSync(filename, encoding) {
        return this.content;
    }
    isDirectory(file) {
        if (this.isDirectoryFunction === undefined) {
            return this.directoryExists;
        }
        return this.isDirectoryFunction(file);
    }
}
exports.FileSystemMock = FileSystemMock;
//# sourceMappingURL=FileSystemMock.js.map