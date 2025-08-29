import e, { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import { formatResponse } from "../utils/response";

const validateRequestContent = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        });

        next();
    } catch (error: any) {
        // return formatResponse(res, 400, "Bad Request", null, error.errors);
        next(error);
    }
}

export default validateRequestContent;