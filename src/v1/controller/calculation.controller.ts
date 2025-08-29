import { Request, Response, NextFunction } from "express";
import { formatResponse } from "../utils/response";
import { scoreCalc } from "../service/calculation.service";
import { createSession } from "better-sse";
import { ScoreCalculationBodySchema } from "../schema/calculation.schema";
import { performance } from "perf_hooks";
import logger from "../utils/logger";

let scoreSession: any;

export const baseCalcHandler = async (req: Request, res: Response, next: NextFunction) => {
    return formatResponse(res, 200, "OK" ,"Model-MS: Welcome to Calculation Router!", null);
}

// export const calcSSEHandler = async (req: Request, res: Response, next: NextFunction) => {
//     scoreSession = await createSession(req, res);
//     res.sse = scoreSession;

//     res.sse.push("Connected to score calculation stream", "connected");
    
//     res.sse.addListener("score", (data: any) => {
//         res.write(`data: ${JSON.stringify(data)}\n\n`);
//     });

//     res.sse.addListener("message", (data: any) => {
//         res.write(`data: ${JSON.stringify(data)}\n\n`);
//     });
// }

// export const scoreCalcHandler = async (req: Request<{}, {}, ScoreCalculationBodySchema, {}>, res: Response, next: NextFunction) => {
//     const userAns = req.body.userAns;
//     const benchAns = req.body.benchAns;
//     const benchKeys = req.body.benchKeys;

//     res.sse = scoreSession;

//     res.sse.push("Score calculation in progress..", "calculation");

//     try {
//         scoreCalc(userAns, benchAns, benchKeys, res);
//         return formatResponse(res, 200, "OK", "Score calculation started", null);
        
//     } catch (error: any) {
//         next(error);
//     }
// }
export const scoreCalcHandler = async (req: Request<{}, {}, ScoreCalculationBodySchema, {}>, res: Response, next: NextFunction) => {
    const userAns = req.body.userAns;
    const benchAns = req.body.benchAns;
    const benchKeys = req.body.benchKeys;

    try {
        const t0 = performance.now();

        let now = new Date();
        logger.warn(`Entry ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
        logger.log("warn", `Entry ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);

        const score = await scoreCalc(userAns, benchAns, benchKeys);

        const t1 = performance.now();
        logger.warn(`Execution time: ${(t1 - t0) / 1000} s`);
        now = new Date();

        logger.warn(`Exit ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
        logger.log("warn", `Exit ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);

        logger.log("warn", `Score: ${score}`);
        
        return formatResponse(res, 200, "Score calculated", score, null);
        
    } catch (error: any) {
        next(error);
    }
}