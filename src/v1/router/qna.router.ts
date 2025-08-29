import express from 'express';
import { baseQnAHandler, createQnAHandler } from '../controller/qna.controller';

const QnARouter = express.Router();

QnARouter.get('/', baseQnAHandler);
QnARouter.post('/generate', createQnAHandler);

export default QnARouter;