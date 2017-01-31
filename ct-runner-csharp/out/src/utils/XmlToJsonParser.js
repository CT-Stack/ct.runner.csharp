"use strict";
class XmlToJsonParser {
    parseString(value, callback) {
        var xml2js = require('xml2js');
        xml2js.parseString(value, callback);
    }
}
exports.XmlToJsonParser = XmlToJsonParser;
//# sourceMappingURL=XmlToJsonParser.js.map