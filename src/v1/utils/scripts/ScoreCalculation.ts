import { spawn } from "child_process";
import logger from "../logger";

export const ScoreCalculation = async (userAns: string, benchAns: string, benchKeys: Array<string>) : Promise<number> => {

    const score = await new Promise<number>((resolve, reject) => {
        const childPy = spawn("python", ["build/v1/utils/scripts/ner.py", userAns, benchAns, ...benchKeys]);

        let score!: number;

        childPy.stdout.on("data", (data: any) => {
            score = parseFloat(data.toString());
        });

        childPy.stderr.on("data", (data: any) => {
            logger.error(data.toString());
        });

        childPy.on("close", (code: any) => {
            if (code === 0) {
                resolve(score);
            } else {
                reject("Error in score calculation");
            }
        });
    });
    
    return score;
}