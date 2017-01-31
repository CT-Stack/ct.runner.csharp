//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
"use strict";
// The module 'assert' provides assertion methods from node
const assert = require("assert");
const XmlFileParser_1 = require("./../../src/utils/XmlFileParser");
const FileSystemMock_1 = require("./mocks/FileSystemMock");
const XmlToJsonParserMock_1 = require("./mocks/XmlToJsonParserMock");
// Defines a Mocha test suite to group tests of similar kind together
suite("XmlFileParser tests", () => {
    // Defines a Mocha unit test
    test("When filepath is empty then call callback with Error", () => {
        var sut = new XmlFileParser_1.XmlFileParser();
        sut.xmlFileToJsonAsync('', (parsedFileContent, error, self) => {
            assert.notEqual(error, null);
            assert.equal(error.message, "File path not given");
        }, this);
    });
    test("When filepath not exists then call callback with Error", () => {
        var fsMock = new FileSystemMock_1.FileSystemMock("", false);
        var sut = new XmlFileParser_1.XmlFileParser(fsMock);
        sut.xmlFileToJsonAsync('C:\Users', (parsedFileContent, error, self) => {
            assert.notEqual(error, null);
            assert.equal(error.message, "File not exists");
        }, this);
    });
    test("When filecontent is empty then call callback with Error", () => {
        var fsMock = new FileSystemMock_1.FileSystemMock("", true, undefined, undefined, true);
        var sut = new XmlFileParser_1.XmlFileParser(fsMock);
        sut.xmlFileToJsonAsync('C:\Users', (parsedFileContent, error, self) => {
            assert.notEqual(error, null);
            assert.equal(error.message, "Cannot read file");
        }, this);
    });
    test("When filecontent is not empty then call xml2js", () => {
        var xml2jsMock = new XmlToJsonParserMock_1.XmlToJsonParserMock();
        var fsMock = new FileSystemMock_1.FileSystemMock("correct content", true, undefined, undefined, true);
        var sut = new XmlFileParser_1.XmlFileParser(fsMock, xml2jsMock);
        sut.xmlFileToJsonAsync('C:\Users', (parsedFileContent, error, self) => {
        }, this);
        assert.equal(xml2jsMock.wasCalled, true);
    });
});
//# sourceMappingURL=XmlFileParser.test.js.map