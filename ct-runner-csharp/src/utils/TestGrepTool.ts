import {IGrepTool} from './IGrepTool'
import {IFileSystem} from './IFileSystem'
import {FileSystem} from './FileSystem'
import {FileLinePair} from './FileLinePair'

export class TestGrepTool implements IGrepTool {

    constructor(private fileSystem: IFileSystem  = new FileSystem())
    {}

    public grep(file: string, lookingPhrase: string): FileLinePair {
        if (!file || !lookingPhrase) {
            return null;
        }
        return this.fileSystem.isDirectory(file) ? this.grepDir(file, lookingPhrase) : this.grepFile(file, lookingPhrase);
    }

    private grepDir(dir: string, lookingPhrase: string): FileLinePair {
        var dirName = this.getDirNameFromFullPath(dir);
        if (dirName === "" || dirName.localeCompare("bin") === 0 || dirName.localeCompare("obj") === 0 ||
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

    private grepFile(file: string, lookingPhrase: string): FileLinePair {
        var line = 0;
        try {
            line = this.getLineOfLookingPhrase(file, lookingPhrase);
        } catch (e) {
            return null;
        }
        return new FileLinePair(file, line);
    }

    private getLineOfLookingPhrase(file: string, lookingPhrase: string): number {
        var fileContent = this.readFile(file);
        var testNameSplitted = lookingPhrase.split("."); // namespace.className.testName
        var inProperClass = false;
        var lineNumber = 0;
        for (var line of fileContent) {
            if (line.search("class") !== -1) {
                var className = testNameSplitted[testNameSplitted.length - 2];
                inProperClass = line.search(className) !== -1;
            } else if (line.search(testNameSplitted[testNameSplitted.length - 1]) !== -1 && inProperClass) {
                return lineNumber;
            }
            lineNumber++;
        }
        throw new Error("Looking phrase not found");
    }

    private readFile(filePath: string): string[] {
        if (!filePath) {
            return [];
        }
        var content = this.fileSystem.readFileSync(filePath, "utf-8");
        return content.split("\n");
    }

    private getDirNameFromFullPath(fullPath: string): string {
        if (!fullPath) {
            return "";
        }
        return fullPath.substr(fullPath.lastIndexOf("\\") + 1);
    }
}