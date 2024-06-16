import {Controller, Get, Sse} from '@nestjs/common';
import {AppService} from './app.service';
import {map, Observable, Subject} from "rxjs";

const fs = require('node:fs');

@Controller()
export class AppController {
  private updated = false;
  private subject: Subject<number> = null;

  constructor(private readonly appService: AppService,) {

    this.subject = new Subject()
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/update')
  async getT() {
    console.log('getT')

    const data = await this.appService.getData()
    try {
      console.log('data got');

      fs.writeFileSync('/app/vehicles.csv', data);

      console.log('file created');
      this.updated = true
      this.subject.next(1)
      // file written successfully
    } catch (err) {
      console.error(err);
    }

    return {}
  }

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return this.subject.pipe(map(function () {
      if (this.updated === true) {
        this.updated = false
        console.log('this.updated')
        console.log(this.updated)
        try {
          let data = [
            // ['2015-01-15 19:05:39 +00:00', -73.97642517, 40.73981094],
            // ['2015-01-15 19:05:40 +00:00', -73.96870422, 40.75424576],
          ]
          // -36.848450, 174.762192.
          for (var i = 0; i < 20; i++)
            data.push(
              ['2015-01-15 19:05:39 +00:00', 174.762192 - Math.random() / 10, -36.848450 - Math.random() / 10,]
            )
          // const data = fs.readFileSync('/app/vehicles.csv', 'utf8');

          return {data: data} as MessageEvent

        } catch (err) {
          console.error(err);
        }
      }
    }.bind(this)));
  }
}
