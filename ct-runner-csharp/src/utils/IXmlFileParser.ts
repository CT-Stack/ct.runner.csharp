export interface IXmlFileParser {
    xmlFileToJsonAsync(filePath: string, callback: (parsedFileContent: string | Buffer, error: Error, self: any) => void, self: any): void;
}