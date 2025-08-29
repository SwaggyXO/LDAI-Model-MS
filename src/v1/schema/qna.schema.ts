import { array, object, string, TypeOf } from "zod";

export const createQnABodySchema = object({
    body: object({
        pdfUrl: string({
            required_error: "Link to PDF file is required."
        })
    })
});

export const createQuestionSchema = object({
    body: object({
        grade: string({
            required_error: "Grade is required."
        }),
        subject: string({
            required_error: "Subject name is required."
        }),
        chapter: string({
            required_error: "Chapter name is required."
        }),
        question: string({
            required_error: "Question is required."
        }),
        answer: string().optional(),
        options: array(string()).optional(),
        keywords: array(string()).optional()
    })
})

export type CreateQnABody = TypeOf<typeof createQnABodySchema>['body'];
export type CreateQuestionBody = TypeOf<typeof createQuestionSchema>['body'];