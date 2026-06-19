import app from './app';
import { config } from './config/index';

app.listen(config.port, () => {
  console.log(`[User Service] running on port ${config.port}`);
});
