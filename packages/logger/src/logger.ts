export class Logger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  private log(level: string, message: string, ...meta: any[]) {
    const timestamp = new Date().toISOString();
    const metaStr = meta.length ? ` ${JSON.stringify(meta)}` : '';
    console.log(`[${timestamp}] [${this.serviceName}] [${level}] ${message}${metaStr}`);
  }

  info(message: string, ...meta: any[]) {
    this.log('INFO', message, ...meta);
  }

  warn(message: string, ...meta: any[]) {
    this.log('WARN', message, ...meta);
  }

  error(message: string, ...meta: any[]) {
    this.log('ERROR', message, ...meta);
  }

  debug(message: string, ...meta: any[]) {
    this.log('DEBUG', message, ...meta);
  }
}

export const createLogger = (serviceName: string) => new Logger(serviceName);
export default Logger;
