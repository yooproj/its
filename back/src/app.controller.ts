import {Controller, Get, Sse} from '@nestjs/common';
import {AppService} from './app.service';
import {map, Observable, Subject} from "rxjs";

const fs = require('node:fs');

@Controller()
export class AppController {
  private updated = false;
  private subject: Subject<object> = null;

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

      this.updated = true
      this.subject.next(data)
    } catch (err) {
      console.error(err);
    }

    return {}
  }

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return this.subject.pipe(map(function (data) {
      if (this.updated === true) {
        this.updated = false
        console.log('this.updated')
        console.log(this.updated)
        try {
          return {data} as MessageEvent

        } catch (err) {
          console.error(err);
        }
      }
    }.bind(this)));
  }
}
