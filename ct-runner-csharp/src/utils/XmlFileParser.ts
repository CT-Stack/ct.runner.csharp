import {IXmlFileParser} from './IXmlFileParser'
import {IFileSystem} from './IFileSystem'
import {FileSystem} from './FileSystem'
import {IXmlToJsonParser} from './IXmlToJsonParser'
import {XmlToJsonParser} from './XmlToJsonParser'

export class XmlFileParser implements IXmlFileParser {

    constructor (private fileSystem: IFileSystem = new FileSystem(),
                 private xml2js: IXmlToJsonParser = new XmlToJsonParser())
    {}

    xmlFileToJsonAsync(filePath: string, callback: (parsedFileContent: string | Buffer, error: Error, self: any) => void, self: any): void {
        if (!filePath) {
            var error = new Error("File path not given");
            callback(null, error, self);
            return;
        }
        if (!this.fileSystem.isDirectory(filePath))
        {
            var error = new Error("Directory not exists");
            callback(null, error, self);
            return;
        }
        var fileContent = this.fileSystem.readFileSync(filePath, "utf-8");
        if (!fileContent) {
            var error = new Error("Cannot read file");
            callback(null, error, self);
            return;
        }
        this.xml2js.parseString(fileContent, function(err, result) {
            callback(result, err, self);
        });
    }
}