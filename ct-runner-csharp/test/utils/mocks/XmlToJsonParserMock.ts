import {IXmlToJsonParser} from './../../../src/utils/IXmlToJsonParser'

export class XmlToJsonParserMock {
    public wasCalled: boolean = false;
    parseString(value: string, callback: (err: Error, result: Buffer) => void): void{
        this.wasCalled = true;
    }
}