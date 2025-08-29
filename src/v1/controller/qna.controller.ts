import { NextFunction, Request, Response } from "express";
import { formatResponse } from "../utils/response";
import { QnAGenerator } from "../utils/scripts/QnAGenerator";
import { CreateQnABody, CreateQuestionBody } from "../schema/qna.schema";

export const baseQnAHandler = async (req: Request, res: Response, next: NextFunction) => {
    return formatResponse(res, 200, "OK" ,"Model-MS: Welcome to QnA Router!", null);
}

export const createQnAHandler = (req: Request<{}, {}, CreateQnABody>, res: Response, next: NextFunction) => {
    const pdfUrl = req.body.pdfUrl;

    QnAGenerator(pdfUrl, (err: any, data: any) => {
        if (err) {
            next(err);
        }
        else {
            return formatResponse(res, 200, "QnA generated successfully", data, null);
        }
    });
}