import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TelemetryMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TelemetryMiddleware.name);

  use(req: Request, _: Response, next: NextFunction) {
    const userId = req.headers['x-user-id'];
    const path = req.originalUrl || req.url;
    const method = req.method;

    const userIdentifier = userId ? userId : 'ANONYMOUS';

    this.logger.log(`[User: ${userIdentifier}] accedió a ${path} - ${method}`);

    next();
  }
}
