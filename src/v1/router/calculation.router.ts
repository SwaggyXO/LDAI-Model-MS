import express, {Request, Response} from 'express';
import { baseCalcHandler, scoreCalcHandler } from '../controller/calculation.controller';
import fs from 'fs';

const CalculationRouter = express.Router();

CalculationRouter.get('/', baseCalcHandler);
// CalculationRouter.get('/stream', calcSSEHandler);
CalculationRouter.post('/score', scoreCalcHandler);

CalculationRouter.get('/score/logs', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    let logData = '';

    const logFilePath = '/usr/src/app/src/v1/utils/logs/all.log';
    const logStream = fs.createReadStream(logFilePath, { encoding: 'utf8' });

    logStream.on('data', (data) => {
        logData += data;
    });

    fs.watchFile(logFilePath, (curr, prev) => {
        if (curr.mtime !== prev.mtime) {
            const newLogData = fs.readFileSync(logFilePath, 'utf8');
            const newLines = newLogData.replace(logData, '');
            if (newLines.trim() !== '') {
                const cleanLines = newLines.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '');
                logData = newLogData;
                res.write(`data: ${cleanLines}\n\n`);
            }
        }
    });

    req.on('close', () => {
        fs.unwatchFile(logFilePath);
        logStream.close();
    });
});

export default CalculationRouter;