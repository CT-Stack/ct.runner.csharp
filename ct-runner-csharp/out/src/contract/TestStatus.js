"use strict";
(function (TestStatus) {
    TestStatus[TestStatus["Pass"] = 0] = "Pass";
    TestStatus[TestStatus["Fail"] = 1] = "Fail";
    TestStatus[TestStatus["Unexecuted"] = 2] = "Unexecuted";
})(exports.TestStatus || (exports.TestStatus = {}));
var TestStatus = exports.TestStatus;
//# sourceMappingURL=TestStatus.js.map