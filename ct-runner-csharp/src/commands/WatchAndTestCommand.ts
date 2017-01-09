import {ICommand} from './ICommand'
import * as vscode from 'vscode';
import * as childProc from 'child_process'

class TestInfo {
    name: string;
    status: boolean;
    path: string;
    line: number;

    constructor(name: string, status:boolean) {
        this.name = name;
        this.status = status;
        this.path = "";
        this.line = 0;
    }
}

class FileLinePair {
    file: string;
    line: number;

    constructor(file: string, line: number) {
        this.file = file;
        this.line = line;
    }
}

export class WatchAndTestCommand implements ICommand {
    public static get EXIT_TEXT(): string { return "dotnet exit code"; }

    private workingDir: string;
    private xmlLogsFilePath: string;

    constructor(workingDir: string, xmlLogsFilePath: string) {
        this.workingDir = workingDir;
        this.xmlLogsFilePath = xmlLogsFilePath;
    }

    public execute(): void {
        var child = childProc.spawn("dotnet watch test -parallel none -quiet -xml " + this.xmlLogsFilePath, [],
            {
                cwd: this.workingDir,
                shell: true
            }
        );
        var self = this;
        child.stdout.on("data", function(data) {
            self.readCallback(data);
        });

        process.on("exit", function () {
            child.kill();
        });
    }

    private readCallback(data): void {
        if (!data) {
            return;
        }
        var splitted = data.toString().split("\n").filter(function(value, index, array) {
            return value.localeCompare("");
        });

        for (var line of splitted) {
            if (line.search(WatchAndTestCommand.EXIT_TEXT) != -1) {
                var exit_code = parseInt(line[line.length - 2]);
                this.readXmlResultFile(this.workingDir + "\\" + this.xmlLogsFilePath);
                break;
            }
        }
    }

    private readXmlResultFile(filePath: string): void {
        if (!filePath) {
            return;
        }
        var xml2js = require("xml2js");
        var fileSystem = require("fs");

        var testsInfo: TestInfo[] = [];
        var xmlParser = xml2js.Parser();
        var self = this;
        fileSystem.readFile(filePath, function(err, data) {
            xmlParser.parseString(data, function(err, result) {
                var collections = result["assemblies"]["assembly"][0]["collection"];
                for (var collection of collections) {
                    var tests = collection["test"];
                    for (var test of tests) {
                        var testName = test["$"]["name"];
                        var testPassed = test["$"]["result"].localeCompare("Pass") == 0 ? true : false;
                        var testResultPair = new TestInfo(testName, testPassed);
                        if (!testPassed) {
                            var failure = test["failure"][0]["stack-trace"][0];
                            testResultPair.path = self.getTestPathFromFailureMsg(failure);
                            testResultPair.line = self.getTestLineFromFailureMsg(failure);
                        }
                        testsInfo.push(testResultPair);
                    }
                }
                var completed = self.completeTestsInfo(testsInfo);
                for (var t of completed) {
                    console.log(t.name);
                    console.log(t.status);
                    console.log(t.path);
                    console.log(t.line);
                }
            });
        });
    }

    private getTestPathFromFailureMsg(failureMsg: string): string {
        if (!failureMsg) {
            return "";
        }
        var strSplitted = failureMsg.split(" ");
        var nonParsedPathStr = strSplitted[strSplitted.length - 2];
        return nonParsedPathStr.substr(0, nonParsedPathStr.lastIndexOf(":"));
    }

    private getTestLineFromFailureMsg(failureMsg: string): number {
        if (!failureMsg) {
            return -1;
        }
        return parseInt(failureMsg.split(" ").pop());
    }

    private completeTestsInfo(tests: TestInfo[]): TestInfo[] {
        if (!tests) {
            return;
        }
        var result = tests;
        for (var test of result) {
            if (test.path.localeCompare("") == 0) {
                var testInfo = this.getTestPathAndLine(test.name);
                if (testInfo) {
                    test.path = testInfo.file;
                    test.line = testInfo.line;
                }
            }
        }
        return result;
    }

    private getTestPathAndLine(testName: string): FileLinePair {
        if (!testName) {
            return null;
        }
        return this.grepForTestNameInDir(testName, this.workingDir);
    }

    private grepForTestNameInDir(testName: string, dirPath: string): FileLinePair {
        if (!testName || !dirPath) {
            return null;
        }
        var fileSystem = require("fs");
        var files = fileSystem.readdirSync(dirPath);
        if (files) {
            for (var file of files) {
                var isDir = fileSystem.lstatSync(dirPath + "\\" + file).isDirectory();
                if (isDir) {
                    if (file.localeCompare("bin") && file.localeCompare("obj")) {
                        var localResult = this.grepForTestNameInDir(testName, dirPath + "\\" + file);
                        if (localResult) {
                            return localResult;
                        }
                    }
                } else {
                    var fullPath = dirPath + "\\" + file;
                    var content = this.readFile(fullPath);
                    var checkResult = this.checkForTest(content, testName);
                    if (checkResult != -1) {
                        return new FileLinePair(fullPath, checkResult);
                    }
                }
            }
        }
        return null;
    }

    private checkForTest(fileContent: string[], testName: string): number {
        if (!fileContent || !testName) {
            return -1;
        }
        var testNameSplitted = testName.split("."); // className.testName
        var inProperClass = false;
        var lineNumber = 0;
        for (var line of fileContent) {
            if (line.search("class") != -1) {
                if (line.search(testNameSplitted[0]) != - 1) {
                    inProperClass = true;
                } else {
                    inProperClass = false;
                }
            } else if (line.search(testNameSplitted[1]) != -1 && inProperClass) {
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
        var fileSystem = require("fs");
        var content = fileSystem.readFileSync(filePath, "utf-8");
        return content.split("\n");
    }
}