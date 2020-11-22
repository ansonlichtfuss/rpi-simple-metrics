import Cors from 'cors';
import initMiddleware from './init-middleware';

export const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    origin: ['https://www.ansonlichtfuss.com', 'http://localhost:8000'],
    methods: ['GET', 'OPTIONS'],
  })
);