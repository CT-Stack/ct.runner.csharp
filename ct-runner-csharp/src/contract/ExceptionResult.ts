export class ExceptionResult {
    constructor(private message:string, private errorType:string, private lineWithError: number = 0){}
    
    get ErrorMessage () : string{
        return this.message;
    }

    get ErrorType () : string{
        return this.errorType;
    }

    get LineWithError () : number {
        return this.lineWithError;
    }
}