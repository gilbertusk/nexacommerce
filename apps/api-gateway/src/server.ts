import app from './app';
import { config } from './config/index';

app.listen(config.port, () => {
  console.log(`[API Gateway] running on port ${config.port}`);
});
