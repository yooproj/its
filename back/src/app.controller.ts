import {Controller, Get, Sse} from '@nestjs/common';
import {AppService} from './app.service';
import {map, Observable, Subject} from "rxjs";

@Controller()
export class AppController {
  private subject: Subject<object> = null;

  constructor(private readonly appService: AppService,) {

    this.subject = new Subject()
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/update')
  async update() {
    const data = await this.appService.getData()
    try {
      this.subject.next(data)
    } catch (err) {
      console.error(err);
    }

    return {}
  }

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    setInterval(() => {
      console.log('inside setInterval')
      this.appService.getData().then((d) => {
        this.subject.next(d)
      })

    }, 5000)

    return this.subject.pipe(map(function (data) {
      return {data} as MessageEvent
    }.bind(this)));
  }
}
