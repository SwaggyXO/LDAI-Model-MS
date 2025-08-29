import { spawn } from "child_process"

export const createQKeywords = async (benchAns: string) => {
    const keywords = await new Promise<string[]>((resolve, reject) => {
        const childPy = spawn("python", ["build/v1/utils/scripts/keywordgen.py", benchAns]);

        let resultArr!: string[];
        
        childPy.stdout.on("data", (data: any) => {
            resultArr = JSON.parse(data.toString());
        });

        childPy.stderr.on("data", (data: any) => {
            console.log(data.toString());
        });

        childPy.on("close", (code: any) => {
            if (code === 0) {
                resolve(resultArr);
            } else {
                reject("Error in keyword generation");
            }
        });
    });

    return keywords;
}