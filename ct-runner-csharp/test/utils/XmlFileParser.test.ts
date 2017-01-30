//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../../src/extension';
import {XmlFileParser} from './../../src/utils/XmlFileParser'
import {FileSystemMock} from './mocks/FileSystemMock'
import {XmlToJsonParserMock} from './mocks/XmlToJsonParserMock'

// Defines a Mocha test suite to group tests of similar kind together
suite("XmlFileParser tests", () => {

    // Defines a Mocha unit test
    test("When filepath is empty then call callback with Error", () => {
        var sut = new XmlFileParser();
        sut.xmlFileToJsonAsync('', (parsedFileContent:string | Buffer, error: Error, self: any)=> {
            assert.notEqual(error, null);
            assert.equal(error.message, "File path not given");
        }, this);
    });


    test("When filepath not exists then call callback with Error", () => {
        var fsMock = new FileSystemMock("", false);
        var sut = new XmlFileParser(fsMock);
        sut.xmlFileToJsonAsync('C:\Users', (parsedFileContent:string | Buffer, error: Error, self: any)=> {
            assert.notEqual(error, null);
            assert.equal(error.message, "Directory not exists");
        }, this);
    });

    test("When filecontent is empty then call callback with Error", () => {
        var fsMock = new FileSystemMock("", true);
        var sut = new XmlFileParser(fsMock);
        sut.xmlFileToJsonAsync('C:\Users', (parsedFileContent:string | Buffer, error: Error, self: any)=> {
            assert.notEqual(error, null);
            assert.equal(error.message, "Cannot read file");
        }, this);
    });

    test("When filecontent is not empty then call xml2js", () => {
        var xml2jsMock = new XmlToJsonParserMock();
        var fsMock = new FileSystemMock("correct content", true);
        var sut = new XmlFileParser(fsMock, xml2jsMock);
        sut.xmlFileToJsonAsync('C:\Users', (parsedFileContent:string | Buffer, error: Error, self: any)=> {
        }, this);
        assert.equal(xml2jsMock.wasCalled, true);
    });
});