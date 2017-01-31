"use strict";
class FileSystemMock {
    constructor(content, directoryExists, readDirs, isDirectoryFunction, fileExists) {
        this.content = content;
        this.directoryExists = directoryExists;
        this.readDirs = readDirs;
        this.isDirectoryFunction = isDirectoryFunction;
        this.fileExists = fileExists;
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
    fileExistsSync(path) {
        if (this.fileExists === undefined)
            return false;
        return this.fileExists;
    }
}
exports.FileSystemMock = FileSystemMock;
//# sourceMappingURL=FileSystemMock.js.map