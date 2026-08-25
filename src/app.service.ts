import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  goodBye(): string {
    return 'odio las putas bien perras';
  }
}
