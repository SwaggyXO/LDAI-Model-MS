import { Response } from "express";
import { ScoreCalculation } from "../utils/scripts/ScoreCalculation";

// export const scoreCalc = async (userAns: string, benchAns: string, benchKeys: Array<string>, res: Response) => {
//     try {
//         const score = await ScoreCalculation(userAns, benchAns, benchKeys);
//         res.sse.push({
//             score: score
//         }, "score");
//         res.destroy();
        
//     } catch (error: any) {
//         throw new Error(error);
//     }
// }
export const scoreCalc = async (userAns: string, benchAns: string, benchKeys: Array<string>) => {
    try {
        const score = await ScoreCalculation(userAns, benchAns, benchKeys);
        console.log(score);
        return score;
        
    } catch (error: any) {
        console.log(error);
        throw new Error(error);
    }
}