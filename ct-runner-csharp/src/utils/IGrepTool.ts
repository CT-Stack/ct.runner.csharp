import {FileLinePair} from './FileLinePair'

export interface IGrepTool {
    grep (file: string, lookingPhrase: string): FileLinePair; 
}