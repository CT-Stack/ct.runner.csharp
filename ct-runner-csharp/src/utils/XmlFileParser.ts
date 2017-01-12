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
        var error: Error = null;
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
        this.xml2js.parseString(fileContent, function(err, result) {
            callback(result, err, self);
        });
    }
}