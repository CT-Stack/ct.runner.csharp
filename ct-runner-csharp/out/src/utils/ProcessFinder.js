"use strict";
const childProc = require('child_process');
class ProcessFinder {
    constructor() {
    }
    spawn(command, args, options) {
        return childProc.spawn(command, args, options);
    }
}
exports.ProcessFinder = ProcessFinder;
//# sourceMappingURL=ProcessFinder.js.map