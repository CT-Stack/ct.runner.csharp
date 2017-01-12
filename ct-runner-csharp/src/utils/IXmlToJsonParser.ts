export interface IXmlToJsonParser {
    parseString(value: string, callback: (err: Error, result: Buffer) => void): void;
}