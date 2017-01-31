"use strict";
class TestResult {
    constructor(testName, testStatus, testLine, exceptionResult) {
        this.testName = testName;
        this.testStatus = testStatus;
        this.testLine = testLine;
        this.exceptionResult = exceptionResult;
    }
    get TestStatus() {
        return this.testStatus;
    }
    get TestLine() {
        return this.testLine;
    }
    get ExceptionResult() {
        return this.exceptionResult;
    }
    get TestName() {
        return this.testName;
    }
}
exports.TestResult = TestResult;
//# sourceMappingURL=TestResult.js.map