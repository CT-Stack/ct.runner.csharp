import {IProcessFinder} from './IProcessFinder'
import * as childProc from 'child_process'

export class ProcessFinder implements IProcessFinder {
    constructor()
    {}

    public spawn(command: string, args? :string[], options?: childProc.SpawnOptions): childProc.ChildProcess {
        return childProc.spawn(command, args, options);
    }
}