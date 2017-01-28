import { TestSetResult } from "./TestSetResult";

export class TestTransferObject {
    constructor(private testSetResults: TestSetResult[])
    { }

    get TestSetResults(): TestSetResult[] {
        return this.testSetResults;
    }
    // TODO: Add language/testframework and create filters that will be used in commands to filter 
}