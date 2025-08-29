import express, { NextFunction, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import OpenAPIDoc from './model-ms-open-api-spec.json';
import QnARouter from './router/qna.router';
import { InvalidEndpointException } from './exception/api.exception';
import CalculationRouter from './router/calculation.router';
import { cpuUsage, memUsage, upTime } from './utils/prometheus';

const router = express.Router();

// Health check & metrics
router.get('/health-check', async (_, res: Response) => {
    res.status(200).json({
            message: "LDAI-Model-MS up and running!",
            metrics: {
            uptime: `${(await upTime.get()).values[0].value}s`,
            memoryUsage: `${(await memUsage.get()).values[0].value / 1048576} MB`,
            cpuUsage: `${(await cpuUsage.get()).values[0].value}s`,
        }
    });
});

// Base route
router.get('/', (_, res: Response) => {
    res.status(200).json({
        message: "Welcome to LDAI Model MS!"
    });
});

router.use('/docs', swaggerUi.serve, swaggerUi.setup(OpenAPIDoc));
router.use('/qna', QnARouter);
router.use('/calc', CalculationRouter);

router.all('*', (_, res: Response, next: NextFunction) => {
    const error = new InvalidEndpointException("Not found", "Accessing an invalid endpoint!");
    next(error);
});

export default router;