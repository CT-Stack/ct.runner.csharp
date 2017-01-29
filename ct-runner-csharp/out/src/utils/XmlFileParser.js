"use strict";
const FileSystem_1 = require("./FileSystem");
const XmlToJsonParser_1 = require("./XmlToJsonParser");
class XmlFileParser {
    constructor(fileSystem = new FileSystem_1.FileSystem(), xml2js = new XmlToJsonParser_1.XmlToJsonParser()) {
        this.fileSystem = fileSystem;
        this.xml2js = xml2js;
    }
    xmlFileToJsonAsync(filePath, callback, self) {
        var error = null;
        if (!filePath) {
            error = new Error("File path not given");
        }
        var fileContent = this.fileSystem.readFileSync(filePath, "utf-8");
        if (!fileContent) {
            error = new Error("Cannot read file");
        }
        if (error) {
            callback(null, error, self);
            return;
        }
        this.xml2js.parseString(fileContent, function (err, result) {
            callback(result, err, self);
        });
    }
}
exports.XmlFileParser = XmlFileParser;
//# sourceMappingURL=XmlFileParser.js.map