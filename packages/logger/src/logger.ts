import { getRequestId } from './request-context';

export class Logger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  private log(level: string, message: string, ...meta: any[]) {
    const timestamp = new Date().toISOString();
    const metaStr = meta.length ? ` ${JSON.stringify(meta)}` : '';
    // The correlation id is what makes lines from one customer action findable
    // together across services. Omitted entirely when there is no context, so
    // startup and shutdown logs are not padded with an empty field.
    const requestId = getRequestId();
    const correlation = requestId ? ` [${requestId}]` : '';
    console.log(`[${timestamp}] [${this.serviceName}]${correlation} [${level}] ${message}${metaStr}`);
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
