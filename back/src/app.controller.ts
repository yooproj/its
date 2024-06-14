import {Controller, Get, Res, Sse} from '@nestjs/common';
import { AppService } from './app.service';
import {interval, map, Observable} from "rxjs";
import { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('/t')
  getT(@Res() response: Response) {
    response
      .type('text/html')
      .send(readFileSync(join('/app/src/', 'index.html')).toString());
  }

  @Sse('sse')
  sse(): Observable<MessageEvent> {

    return interval(2000).pipe(map( function(){
      let data = [
        // ['2015-01-15 19:05:39 +00:00', -73.97642517, 40.73981094],
        // ['2015-01-15 19:05:40 +00:00', -73.96870422, 40.75424576],
      ]
        // -36.848450, 174.762192.
      for (var i=0;i<20;i++)
        data.push(
          ['2015-01-15 19:05:39 +00:00',  174.762192- Math.random()/10,-36.848450- Math.random()/10,]
        )
      return { data: data } as MessageEvent
    }));
  }
}
