import {IFileSystem} from './IFileSystem'
import * as fs from 'fs'

export class FileSystem implements IFileSystem {
    public readDirSync(path: string | Buffer): string[] {
        return fs.readdirSync(path);
    }

    public readFileSync(filename: string, encoding: string): string {
        return fs.readFileSync(filename, encoding);
    }

    public isDirectory(file: string | Buffer): boolean {
        return fs.lstatSync(file).isDirectory();
    }
}