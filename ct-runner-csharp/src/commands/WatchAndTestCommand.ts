import {ICommand} from "./ICommand"
import * as vscode from 'vscode';
import * as childProc from 'child_process'

export class WatchAndTestCommand implements ICommand {
    public static get EXIT_TEXT(): string { return "dotnet exit code"; }
    public static get STACK_TRACE_TEXT(): string { return "Stack Trace:"; }

    private buffer: string[]

    constructor() {
        this.buffer = [];
    }

    public execute(): void {
        // rmdir /s /q &&
        var child = childProc.spawn('dotnet watch test -parallel none -quiet', [],
            {
                cwd: 'C:\\Users\\Grzegorz\\Desktop\\dotnetcore\\tests',
                shell: true
            }
        );
        var self = this;
        child.stdout.on('data', function(data) {
            self.readCallback(data);
        });

        process.on('exit', function () {
            child.kill();
        });
    }

    private readCallback(data): void {
        var splitted = data.toString().split('\n').filter(function(value, index, array) {
            return value.localeCompare('');
        });

        for (var i = 0; i < splitted.length; i++) {
            this.buffer.push(splitted[i]);
            if (splitted[i].search(WatchAndTestCommand.EXIT_TEXT) != -1) {
                var exit_code = parseInt(splitted[i][splitted[i].length - 2]);
                if (exit_code != 0) {
                    this.getFilesInfo(this.buffer);
                }
                break;
            }
        }
    }

    private getFilesInfo(buffer): void {
        for (var i = 0; i < buffer.length; i++) {
            var pos = buffer[i].search(WatchAndTestCommand.STACK_TRACE_TEXT);
            if (pos != -1) {
                var filePathLine = buffer[++i];
                var fileNameEnd = filePathLine.indexOf('(', filePathLine.lastIndexOf('\\')); //for windows
                var lineNumberStringStart = fileNameEnd + 1;
                var lineNumberStringEnd = filePathLine.indexOf(',', lineNumberStringStart);
                var filePath = filePathLine.substring(0, fileNameEnd);
                var lineNumber = filePathLine.substring(lineNumberStringStart, lineNumberStringEnd);
                var result = [filePath, lineNumber];
                console.log (`${result[0]} : ${result[1]}`);
            }
        }
        this.buffer.length = 0;
    }
}