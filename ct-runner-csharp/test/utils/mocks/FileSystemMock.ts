import {IFileSystem} from './../../../src/utils/IFileSystem'


export class FileSystemMock implements IFileSystem
{
    constructor(private content: string, private directoryExists: boolean)
    {}

    public readDirSync(path: string | Buffer): string[]
    {
        return null;
    }

    public readFileSync(filename: string, encoding: string): string{
        return this.content;
    }

    public isDirectory(file: String | Buffer | Number): boolean {
        return this.directoryExists;
    }

}