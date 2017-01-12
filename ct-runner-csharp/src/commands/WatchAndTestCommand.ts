import {ICommand} from './ICommand'
import {IXmlFileParser} from '../utils/IXmlFileParser'
import {XmlFileParser} from '../utils/XmlFileParser'
import {IProcessFinder} from '../utils/IProcessFinder'
import {ProcessFinder} from '../utils/ProcessFinder'
import {IGrepTool} from '../utils/IGrepTool'
import {TestGrepTool} from '../utils/TestGrepTool'
import {FileLinePair} from '../utils/FileLinePair'
import * as vscode from 'vscode';
import * as childProc from 'child_process'

class TestInfo {
    constructor(public name: string, public status:boolean,
                public path: string = "", public line: number = 0)
    {}
}

export class WatchAndTestCommand implements ICommand {
    public static get EXIT_TEXT(): string { return "dotnet exit code"; }
    public static get WATCH_CMD(): string { return "dotnet watch test -parallel none -quiet -xml "; }

    constructor(private workingDir: string, private xmlLogsFilePath: string,
                private xmlFileParser: IXmlFileParser = new XmlFileParser(),
                private processFinder: IProcessFinder = new ProcessFinder(),
                private grepTool: IGrepTool = new TestGrepTool())
    {}

    public execute(): void {
        var childProcess = this.processFinder.spawn(WatchAndTestCommand.WATCH_CMD + this.xmlLogsFilePath, [],
            {
                cwd: this.workingDir,
                shell: true
            }
        );
        if (!childProcess) {
            return;
        }
        var self = this;
        childProcess.stdout.on("data", function(data) {
            self.readCallback(data);
        });

        childProcess.on("exit", function () {
            childProcess.kill();
        });
    }

    private readCallback(data: string | Buffer): void {
        if (!data) {
            return;
        }
        var splittedDataStr = this.splitRawData(data, "\n");

        for (var line of splittedDataStr) {
            if (line.search(WatchAndTestCommand.EXIT_TEXT) !== -1) {
                var exit_code = parseInt(line[line.length - 2]);
                this.gatherTests(this.workingDir + "\\" + this.xmlLogsFilePath);
                break;
            }
        }
    }

    private splitRawData(data: string | Buffer, separator: string): string[] {
        if (!data) {
            return [];
        }
        return data.toString().split(separator).filter(function(value, index, array) {
            return value.localeCompare("");
        });
    }

    private gatherTests(filePath: string): void {
        if (!filePath) {
            return;
        }
        try {
            this.xmlFileParser.xmlFileToJsonAsync(filePath, this.xmlFileParsedCallback, this);
        } catch (e) {
            console.log(e.message);
        }
    }

    private xmlFileParsedCallback(parsedFileContent: string | Buffer, error: Error, self: any): void {
        if (error) {
            return;
        }
        if (!parsedFileContent) {
            return;
        }
        var testsInfo = self.getTestsFromJson(parsedFileContent);
        if (!testsInfo) {
            return;
        }
        var completed = self.completeTestsInfo(testsInfo);
        for (var t of completed) {
            console.log(t.name);
            console.log(t.status);
            console.log(t.path);
            console.log(t.line);
        }
    }

    private getTestsFromJson(parsedContent: string | Buffer): TestInfo[] {
        if (!parsedContent) {
            return;
        }
        var testsInfo: TestInfo[] = [];
        var collections = parsedContent["assemblies"]["assembly"][0]["collection"];
        for (var collection of collections) {
            var tests = collection["test"];
            for (var test of tests) {
                var testInfo = this.gatherTestInfo(test);
                if (testInfo) {
                    testsInfo.push(testInfo);
                }
            }
        }
        return testsInfo;
    }

    private gatherTestInfo(test: string | Buffer): TestInfo {
        if (!test) {
            return null;
        }
        var testName = test["$"]["name"];
        var testPassed = test["$"]["result"].localeCompare("Pass") === 0 ? true : false;
        var testResultPair = new TestInfo(testName, testPassed);
        if (!testPassed) {
            var failure = test["failure"][0]["stack-trace"][0];
            testResultPair.path = this.getTestPathFromFailureMsg(failure);
            testResultPair.line = this.getTestLineFromFailureMsg(failure);
        }
        return testResultPair;
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
            if (test.path.localeCompare("") === 0) {
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
        var fileLinePair: FileLinePair = null;
        try {
            fileLinePair = this.grepTool.grep(this.workingDir, testName);
        } catch (e) {
            console.log(e.message);
            return null;
        }
        return fileLinePair;
    }
}