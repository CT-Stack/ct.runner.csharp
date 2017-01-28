import { TestResult } from "./TestResult";

export class TestSetResult {

    constructor(private setName: string, private filePath: string, private testResults: TestResult[] = [])
    { }

    public get SetName(): string {
        return this.setName;
    }

    public get FilePath(): string {
        return this.filePath;
    }

    public get TestResults(): TestResult[] {
        return this.testResults;
    }

    public append(testResult: TestResult) {
        this.testResults.push(testResult);
    }
}