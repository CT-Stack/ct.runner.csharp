import {ICommand} from './ICommand'
import {IXmlFileParser} from '../utils/IXmlFileParser'
import {XmlFileParser} from '../utils/XmlFileParser'
import {IProcessFinder} from '../utils/IProcessFinder'
import {ProcessFinder} from '../utils/ProcessFinder'
import {IGrepTool} from '../utils/IGrepTool'
import {TestGrepTool} from '../utils/TestGrepTool'
import {FileLinePair} from '../utils/FileLinePair'

import {TestSetResult} from '../contract/TestSetResult'
import {TestResult} from '../contract/TestResult'
import {TestTransferObject} from '../contract/TestTransferObject'
import {TestStatus} from '../contract/TestStatus'
import {ExceptionResult} from '../contract/ExceptionResult'

import * as vscode from 'vscode';
import * as childProc from 'child_process'

class TestInfo {
    constructor(public name: string, public status:boolean,
                public path: string = "", public line: number = 0,
                public exceptionResult?: ExceptionResult)
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
		if (!completed) {
			return;
		}
        var testTransferObject: TestTransferObject = self.prepareTransferObject(completed);
        vscode.commands.executeCommand("ctdisplay.updateTests", testTransferObject);
    }

    private prepareTransferObject(tests: TestInfo[]): TestTransferObject {
        if (!tests) {
            return null;
        }
        var testsSets = this.prepareTestsSets(tests);
        return new TestTransferObject(testsSets);
    }

    private prepareTestsSets(tests: TestInfo[]): TestSetResult[] {
        if (!tests) {
            return null;
        }
        var testsSets: TestSetResult[] = [];
        for (var test of tests) {
            var testSet = testsSets.find(element => element.FilePath.localeCompare(test.path) == 0);
            var testResult = this.prepareTestResult(test);
            if (testSet) {
                testSet.append(testResult);
            } else {
                var path = "/" + test.path.split("\\").join("/");
                testsSets.push(new TestSetResult("", path, [testResult]));
            }
        }
        return testsSets;
    }

    private prepareTestResult(test: TestInfo): TestResult {
        if (!test) {
            return null;
        }
        return new TestResult(test.name, this.getTestStatusFromBool(test.status), test.line, test.exceptionResult);
    }

    private getTestStatusFromBool(testStatus: boolean): TestStatus {
        return testStatus ? TestStatus.Pass : TestStatus.Fail;
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
            var failureMsg = test["failure"][0];
            testResultPair.exceptionResult = this.getExceptionInfoFromFailureMsg(failureMsg);
        }
        return testResultPair;
    }

    private getExceptionInfoFromFailureMsg(failureMsg: string | Buffer): ExceptionResult {
        if (!failureMsg) {
            return null;
        }
        var message: string = failureMsg["message"][0];
        var type: string = failureMsg["$"]["exception-type"];
        var line: number = this.getTestLineStackTraceMsg(failureMsg["stack-trace"][0]);
        return new ExceptionResult(message, type, line - 1);
    }

    private getTestLineStackTraceMsg(failureMsg: string): number {
        if (!failureMsg) {
            return -1;
        }
        return parseInt(failureMsg.split(" ").pop());
    }

    private completeTestsInfo(tests: TestInfo[]): TestInfo[] {
        if (!tests) {
            return null;
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