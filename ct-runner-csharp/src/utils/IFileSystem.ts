export interface IFileSystem {
    readDirSync(path: string | Buffer): string[];
    readFileSync(filename: string, encoding: string): string;
    isDirectory(file: String | Buffer | Number): boolean;
}