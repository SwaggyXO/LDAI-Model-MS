import { array, object, string, TypeOf } from "zod";

export const scoreCalculationSchema = object({
    body: object({
        userAns: string({
            required_error: "User answers are required."
        }),
        benchAns: string({
            required_error: "Benchmark answers are required."
        }),
        benchKeys: array(string({
            required_error: "Benchmark keywords are required."
        }))
    })
});

export type ScoreCalculationBodySchema = TypeOf<typeof scoreCalculationSchema>['body'];