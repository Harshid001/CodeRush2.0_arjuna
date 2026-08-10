export interface LogContext {
  [key: string]: any;
}

export class Logger {
  private format(level: "INFO" | "WARN" | "ERROR" | "DEBUG", message: string, context?: LogContext): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context || {}),
    });
  }

  public info(message: string, context?: LogContext): void {
    console.log(this.format("INFO", message, context));
  }

  public warn(message: string, context?: LogContext): void {
    console.warn(this.format("WARN", message, context));
  }

  public error(message: string, context?: LogContext): void {
    console.error(this.format("ERROR", message, context));
  }

  public debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.format("DEBUG", message, context));
    }
  }
}

export const logger = new Logger();
