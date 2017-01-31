import { IFileSystem } from './../../../src/utils/IFileSystem'


export class FileSystemMock implements IFileSystem {
    constructor(private content: string, private directoryExists: boolean, private readDirs?: string[], private isDirectoryFunction?: (file: String | Buffer | Number) => boolean)
    { }

    public readDirSync(path: string | Buffer): string[] {
        return this.readDirs;
    }

    public readFileSync(filename: string, encoding: string): string {
        return this.content;
    }

    public isDirectory(file: String | Buffer | Number): boolean {
        if (this.isDirectoryFunction === undefined)
        { return this.directoryExists; }
        return this.isDirectoryFunction(file);
    }

}