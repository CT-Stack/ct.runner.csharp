import {IXmlFileParser} from './IXmlFileParser'

export class XmlFileParser implements IXmlFileParser {
    private fileSystem;
    private xml2js;

    constructor () {
        this.fileSystem = require("fs");
        this.xml2js = require("xml2js");
    }

    xmlFileToJsonAsync(filePath: string, callback: (parsedFileContent: string | Buffer, error: Error, self: any) => void, self: any): void {
        if (!filePath) {
            return null;
        }
        var fileContent = this.fileSystem.readFileSync(filePath, "utf-8");
        if (!fileContent) {
            return null;
        }
        var parseStringAsyncMethod = this.xml2js.parseString;
        parseStringAsyncMethod(fileContent, function(err, result) {
            callback(result, err, self);
        });
    }
}