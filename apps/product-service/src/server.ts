import app from './app';
import { config } from './config/index';

app.listen(config.port, () => {
  console.log(`[Product Service] running on port ${config.port}`);
});
