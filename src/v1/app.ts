require('dotenv').config({path: `.env.${process.env.NODE_ENV}`});
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import router from './v1.router';
import morganMiddleware from './middleware/morgan.middleware';
import { urlencoded } from 'body-parser';
import { exceptionFunction } from './middleware/exceptionHandler.middleware';

const app: Application = express();

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(morganMiddleware);
app.use(cors());
app.use(helmet());

app.use("/api/ldai-model/v1", router);

// Exception handling middleware
app.use(exceptionFunction);

export default app;