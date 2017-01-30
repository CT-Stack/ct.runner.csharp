"use strict";
class XmlToJsonParserMock {
    constructor() {
        this.wasCalled = false;
    }
    parseString(value, callback) {
        this.wasCalled = true;
    }
}
exports.XmlToJsonParserMock = XmlToJsonParserMock;
//# sourceMappingURL=XmlToJsonParserMock.js.map