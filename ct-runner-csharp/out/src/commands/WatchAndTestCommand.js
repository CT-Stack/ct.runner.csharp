"use strict";
const XmlFileParser_1 = require('../utils/XmlFileParser');
const ProcessFinder_1 = require('../utils/ProcessFinder');
const TestGrepTool_1 = require('../utils/TestGrepTool');
const TestSetResult_1 = require('../contract/TestSetResult');
const TestResult_1 = require('../contract/TestResult');
const TestTransferObject_1 = require('../contract/TestTransferObject');
const TestStatus_1 = require('../contract/TestStatus');
const ExceptionResult_1 = require('../contract/ExceptionResult');
const vscode = require('vscode');
class TestInfo {
    constructor(name, status, path = "", line = 0, exceptionResult) {
        this.name = name;
        this.status = status;
        this.path = path;
        this.line = line;
        this.exceptionResult = exceptionResult;
    }
}
class WatchAndTestCommand {
    constructor(workingDir, xmlLogsFilePath, xmlFileParser = new XmlFileParser_1.XmlFileParser(), processFinder = new ProcessFinder_1.ProcessFinder(), grepTool = new TestGrepTool_1.TestGrepTool()) {
        this.workingDir = workingDir;
        this.xmlLogsFilePath = xmlLogsFilePath;
        this.xmlFileParser = xmlFileParser;
        this.processFinder = processFinder;
        this.grepTool = grepTool;
    }
    static get EXIT_TEXT() { return "dotnet exit code"; }
    static get WATCH_CMD() { return "dotnet watch test -parallel none -quiet -xml "; }
    execute() {
        var childProcess = this.processFinder.spawn(WatchAndTestCommand.WATCH_CMD + this.xmlLogsFilePath, [], {
            cwd: this.workingDir,
            shell: true
        });
        if (!childProcess) {
            return;
        }
        var self = this;
        childProcess.stdout.on("data", function (data) {
            self.readCallback(data);
        });
        childProcess.on("exit", function () {
            childProcess.kill();
        });
    }
    readCallback(data) {
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
    splitRawData(data, separator) {
        if (!data) {
            return [];
        }
        return data.toString().split(separator).filter(function (value, index, array) {
            return value.localeCompare("");
        });
    }
    gatherTests(filePath) {
        if (!filePath) {
            return;
        }
        try {
            this.xmlFileParser.xmlFileToJsonAsync(filePath, this.xmlFileParsedCallback, this);
        }
        catch (e) {
            console.log(e.message);
        }
    }
    xmlFileParsedCallback(parsedFileContent, error, self) {
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
        var testTransferObject = self.prepareTransferObject(completed);
        vscode.commands.executeCommand("ctdisplay.updateTests", testTransferObject);
    }
    prepareTransferObject(tests) {
        if (!tests) {
            return null;
        }
        var testsSets = this.prepareTestsSets(tests);
        return new TestTransferObject_1.TestTransferObject(testsSets);
    }
    prepareTestsSets(tests) {
        if (!tests) {
            return null;
        }
        var testsSets = [];
        for (var test of tests) {
            var testSet = testsSets.find(element => element.FilePath.localeCompare(test.path) == 0);
            var testResult = this.prepareTestResult(test);
            if (testSet) {
                testSet.append(testResult);
            }
            else {
                var path = "/" + test.path.split("\\").join("/");
                testsSets.push(new TestSetResult_1.TestSetResult("", path, [testResult]));
            }
        }
        return testsSets;
    }
    prepareTestResult(test) {
        if (!test) {
            return null;
        }
        return new TestResult_1.TestResult(test.name, this.getTestStatusFromBool(test.status), test.line, test.exceptionResult);
    }
    getTestStatusFromBool(testStatus) {
        return testStatus ? TestStatus_1.TestStatus.Pass : TestStatus_1.TestStatus.Fail;
    }
    getTestsFromJson(parsedContent) {
        if (!parsedContent) {
            return;
        }
        var testsInfo = [];
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
    gatherTestInfo(test) {
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
    getExceptionInfoFromFailureMsg(failureMsg) {
        if (!failureMsg) {
            return null;
        }
        var message = failureMsg["message"][0];
        var type = failureMsg["$"]["exception-type"];
        var line = this.getTestLineStackTraceMsg(failureMsg["stack-trace"][0]);
        return new ExceptionResult_1.ExceptionResult(message, type, line - 1);
    }
    getTestLineStackTraceMsg(failureMsg) {
        if (!failureMsg) {
            return -1;
        }
        return parseInt(failureMsg.split(" ").pop());
    }
    completeTestsInfo(tests) {
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
    getTestPathAndLine(testName) {
        if (!testName) {
            return null;
        }
        var fileLinePair = null;
        try {
            fileLinePair = this.grepTool.grep(this.workingDir, testName);
        }
        catch (e) {
            console.log(e.message);
            return null;
        }
        return fileLinePair;
    }
}
exports.WatchAndTestCommand = WatchAndTestCommand;
//# sourceMappingURL=WatchAndTestCommand.js.map