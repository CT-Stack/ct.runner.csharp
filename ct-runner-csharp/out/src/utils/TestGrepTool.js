"use strict";
const FileSystem_1 = require("./FileSystem");
const FileLinePair_1 = require("./FileLinePair");
class TestGrepTool {
    constructor(fileSystem = new FileSystem_1.FileSystem()) {
        this.fileSystem = fileSystem;
    }
    grep(file, lookingPhrase) {
        if (!file || !lookingPhrase) {
            return null;
        }
        return this.fileSystem.isDirectory(file) ? this.grepDir(file, lookingPhrase) : this.grepFile(file, lookingPhrase);
    }
    grepDir(dir, lookingPhrase) {
        if (!dir || !lookingPhrase) {
            return null;
        }
        if (!this.fileSystem.isDirectory(dir)) {
            return null;
        }
        var dirName = this.getDirNameFromFullPath(dir);
        if (dirName.localeCompare("bin") === 0 || dirName.localeCompare("obj") === 0 ||
            dirName.localeCompare("node_modules") === 0) {
            return null;
        }
        var files = this.fileSystem.readDirSync(dir);
        if (files) {
            for (var file of files) {
                var fullPath = dir + "\\" + file;
                var localResult = this.fileSystem.isDirectory(fullPath) ? this.grepDir(fullPath, lookingPhrase) :
                    this.grepFile(fullPath, lookingPhrase);
                if (localResult) {
                    return localResult;
                }
            }
        }
        return null;
    }
    grepFile(file, lookingPhrase) {
        if (!file || !lookingPhrase) {
            return null;
        }
        if (this.fileSystem.isDirectory(file)) {
            return null;
        }
        var line = 0;
        try {
            line = this.getLineOfLookingPhrase(file, lookingPhrase);
        }
        catch (e) {
            return null;
        }
        return new FileLinePair_1.FileLinePair(file, line);
    }
    getLineOfLookingPhrase(file, lookingPhrase) {
        if (!file || !lookingPhrase) {
            throw new Error("File path or looking phrase not given");
        }
        var fileContent = this.readFile(file);
        var testNameSplitted = lookingPhrase.split("."); // namespace.className.testName
        var inProperClass = false;
        var lineNumber = 0;
        for (var line of fileContent) {
            if (line.search("class") !== -1) {
                var className = testNameSplitted[testNameSplitted.length - 2];
                inProperClass = line.search(className) !== -1;
            }
            else if (line.search(testNameSplitted[testNameSplitted.length - 1]) !== -1 && inProperClass) {
                return lineNumber;
            }
            lineNumber++;
        }
        throw new Error("Looking phrase not found");
    }
    readFile(filePath) {
        if (!filePath) {
            return [];
        }
        var content = this.fileSystem.readFileSync(filePath, "utf-8");
        return content.split("\n");
    }
    getDirNameFromFullPath(fullPath) {
        if (!fullPath) {
            return "";
        }
        return fullPath.substr(fullPath.lastIndexOf("\\") + 1);
    }
}
exports.TestGrepTool = TestGrepTool;
//# sourceMappingURL=TestGrepTool.js.map