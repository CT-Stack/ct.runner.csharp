import * as assert from 'assert';

import * as vscode from 'vscode';
import * as myExtension from '../../src/extension';
import {TestGrepTool} from './../../src/utils/TestGrepTool';
import {FileSystemMock} from './mocks/FileSystemMock';
import * as fs from "fs";

suite("TestGrepTool tests", () => {

    test("When file is empty then grep returns null", () => {
        var sut = new TestGrepTool();
        var result = sut.grep("", "phrase");
        assert.equal(result, null);
    });

    test("When lookingPhrase is empty then grep returns null", () => {
        var sut = new TestGrepTool();
        var result = sut.grep('C:\Users', "");
        assert.equal(result, null);
    });

    test("When directory is a correct file (with class name and test name) then return FileLinePair", () => {
        var fileSystem = new FileSystemMock(" \nclass SuperClass \n \n Test1", false);
        var sut = new TestGrepTool(fileSystem);
        var filePath = "C:\\Users\\file.xml";
        var result = sut.grep(filePath, "SuperClass.Test1");
        assert.equal(result.file, filePath);
        assert.equal(result.line, 3);
    })

    test("When file doesn't contains searched test name then return null", () => {
        var fileSystem = new FileSystemMock(" \nclass SuperClass \n \n Test1", false);
        var sut = new TestGrepTool(fileSystem);
        var filePath = "C:\\Users\\file.xml";
        var result = sut.grep(filePath, "SuperClass.Test2");
        assert.equal(result, null);
    })

    test("When file doesn't contains class name then return null", () => {
        var fileSystem = new FileSystemMock(" \n \n \n Test1", false);
        var sut = new TestGrepTool(fileSystem);
        var filePath = "C:\\Users\\file.xml";
        var result = sut.grep(filePath, "SuperClass.Test2");
        assert.equal(result, null);
    })

    test("When dir indicates bin folder then return null", () => {
        var fileSystem = new FileSystemMock(" \n \n \n Test1", true);
        var sut = new TestGrepTool(fileSystem);
        var filePath = "C:\\\\Users\\\\bin";
        var result = sut.grep(filePath, "SuperClass.Test1");
        assert.equal(result, null);
    })

    test("When dir indicates obj folder then return null", () => {
        var fileSystem = new FileSystemMock(" \n \n \n Test1", true);
        var sut = new TestGrepTool(fileSystem);
        var filePath = "C:\\\\Users\\\\obj";
        var result = sut.grep(filePath, "SuperClass.Test1");
        assert.equal(result, null);
    })

    test("When dir indicates node_modules folder then return null", () => {
        var fileSystem = new FileSystemMock(" \n \n \n Test1", true);
        var sut = new TestGrepTool(fileSystem);
        var filePath = "C:\\\\Users\\\\node_modules";
        var result = sut.grep(filePath, "SuperClass.Test1");
        assert.equal(result, null);
    })

    test("When dir is empty return null", () => {
        var fileSystem = new FileSystemMock(" \n \n \n Test1", true, []);
        var sut = new TestGrepTool(fileSystem);
        var filePath = "C:\\\\Users\\\\folder";
        var result = sut.grep(filePath, "SuperClass.Test1");
        assert.equal(result, null);
    })

    test("When dir contains file that contains required Test1 then return appropriate FileLinePair", () => {
        var filePath = "C:\\\\Users\\\\folder";
        var fileSystem = new FileSystemMock(" \nclass SuperClass \n \n Test1", true, ['result.xml'], (file)=>{ return file === filePath; });
        var sut = new TestGrepTool(fileSystem);
        var result = sut.grep(filePath, "SuperClass.Test1");
        assert.equal(result.file, 'C:\\\\Users\\\\folder\\result.xml');
        assert.equal(result.line, 3);
    })
});