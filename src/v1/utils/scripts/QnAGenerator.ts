import { spawn } from "child_process";
import logger from "../logger";

export const QnAGenerator = (pdf_path: string, callback: any) => {
    const childPy = spawn("python", ["build/v1/utils/scripts/qna2.py", pdf_path]);

    let dataReceived = "";

    childPy.stdout.on("data", (data: any) => {
        dataReceived += data.toString();
    });

    childPy.stderr.on("data", (data: any) => {
        logger.error(data.toString());
    });

    childPy.on("close", (code: any) => {
        if (code === 0) {
            const data = JSON.parse(dataReceived);
            callback(null, data);
        }

        else callback("Error in QnA generation");
    });
}