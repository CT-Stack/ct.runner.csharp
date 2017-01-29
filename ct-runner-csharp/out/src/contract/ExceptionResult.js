"use strict";
class ExceptionResult {
    constructor(message, errorType, lineWithError = 0) {
        this.message = message;
        this.errorType = errorType;
        this.lineWithError = lineWithError;
    }
    get ErrorMessage() {
        return this.message;
    }
    get ErrorType() {
        return this.errorType;
    }
    get LineWithError() {
        return this.lineWithError;
    }
}
exports.ExceptionResult = ExceptionResult;
//# sourceMappingURL=exceptionResult.js.map