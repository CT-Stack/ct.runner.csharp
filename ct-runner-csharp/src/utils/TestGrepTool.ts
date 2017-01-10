import {IGrepTool} from './IGrepTool'
import {FileLinePair} from './FileLinePair'

export class TestGrepTool implements IGrepTool {

    private fileSystem;

    constructor() {
        this.fileSystem = require("fs");
    }

    public grep(file: string, lookingPhrase: string): FileLinePair {
        if (!file || !lookingPhrase) {
            return null;
        }
        var fileLinePair: FileLinePair = null;
        return this.isDirectory(file) ? this.grepDir(file, lookingPhrase) : this.grepFile(file, lookingPhrase);
    }

    private grepDir(dir: string, lookingPhrase: string): FileLinePair {
        if (!dir || !lookingPhrase) {
            return null;
        }
        if (!this.isDirectory(dir)) {
            return null;
        }
        if (dir.localeCompare("bin") == 0 || dir.localeCompare("obj") == 0) {
            return null;
        }
        var files = this.fileSystem.readdirSync(dir);
        if (files) {
            for (var file of files) {
                var fullPath = dir + "\\" + file;
                var localResult = this.isDirectory(fullPath) ? this.grepDir(fullPath, lookingPhrase) :
                    this.grepFile(fullPath, lookingPhrase);
                if (localResult) {
                    return localResult;
                }
            }
        }
        return null;
    }

    private grepFile(file: string, lookingPhrase: string): FileLinePair {
        if (!file || !lookingPhrase) {
            return null;
        }
        if (this.isDirectory(file)) {
            return null;
        }
        var line = this.getLineOfLookingPhrase(file, lookingPhrase);
        if (line > 0) {
            return new FileLinePair(file, line);
        }
        return null;
    }

    private getLineOfLookingPhrase(file: string, lookingPhrase: string): number {
        if (!file || !lookingPhrase) {
            return -1;
        }
        var fileContent = this.readFile(file);
        var testNameSplitted = lookingPhrase.split("."); // className.testName
        var inProperClass = false;
        var lineNumber = 0;
        for (var line of fileContent) {
            if (line.search("class") !== -1) {
                inProperClass = line.search(testNameSplitted[0]) !== -1;
            } else if (line.search(testNameSplitted[1]) !== -1 && inProperClass) {
                return lineNumber;
            }
            lineNumber++;
        }
        return -1;
    }

    private readFile(filePath: string): string[] {
        if (!filePath) {
            return [];
        }
        var content = this.fileSystem.readFileSync(filePath, "utf-8");
        return content.split("\n");
    }

    private isDirectory(file: string): boolean {
        if (!file) {
            return false;
        }
        var fileSystem = require("fs");
        return fileSystem.lstatSync(file).isDirectory();
    }
}