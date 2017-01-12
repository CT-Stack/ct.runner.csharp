import {IXmlToJsonParser} from './IXmlToJsonParser'

export class XmlToJsonParser implements IXmlToJsonParser {
    parseString(value: string, callback: (err: Error, result: Buffer) => void): void {
        var xml2js = require('xml2js');
        xml2js.parseString(value, callback);
    }
}