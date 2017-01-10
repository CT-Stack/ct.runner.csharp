import * as childProc from 'child_process'

export interface IProcessFinder {
    spawn(command: string, args?: string[], options?: childProc.SpawnOptions): childProc.ChildProcess;
}