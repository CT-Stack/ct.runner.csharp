import {TestStatus} from "./TestStatus"
import {ExceptionResult} from "./exceptionResult";
export class TestResult {

    constructor(private testName:string, 
                private testStatus: TestStatus, 
                private testLine: number, 
                private exceptionResult?: ExceptionResult)
    {}
    
    get TestStatus () : TestStatus {
        return this.testStatus;
    }

    get TestLine () : number {
        return this.testLine;
    }

    get ExceptionResult () : ExceptionResult {
        return this.exceptionResult;
    }

    get TestName () : string {
        return this.testName;
    }
}