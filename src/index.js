import { express } from '#packages/index.js';
import { configMiddlewares } from '#middlewares/index.js';
import connectDatabase from '#database/index.js';
import configRoutes from '#routes/index.js';
import listenServer from '#server/index.js';

const app = express();

connectDatabase();
configMiddlewares(app);
configRoutes(app);
listenServer(app);

export default app;
