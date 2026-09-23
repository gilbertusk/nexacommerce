import app from './app';
import { config } from './config/index';

app.listen(config.port, () => {
  console.log(`[Voucher Service] running on port ${config.port}`);
});
