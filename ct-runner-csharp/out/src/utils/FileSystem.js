"use strict";
const fs = require("fs");
class FileSystem {
    readDirSync(path) {
        return fs.readdirSync(path);
    }
    readFileSync(filename, encoding) {
        return fs.readFileSync(filename, encoding);
    }
    isDirectory(file) {
        return fs.lstatSync(file).isDirectory();
    }
}
exports.FileSystem = FileSystem;
//# sourceMappingURL=FileSystem.js.map