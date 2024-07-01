import {Injectable} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import axios from "axios";

@Injectable()
export class AppService {
  constructor(private readonly http: HttpService) {
  }

  getHello(): string {
    return 'Hello Worldxvxv';
  }

  async getData() {

    return axios({
      method: 'GET',
      url: 'http://itsdata:8000/',
    }).then(m => {
      return m.data
    })

  }

  async getRoutes() {
    return axios({
        method: 'GET',
        url: 'http://itsdata:8000/routes',
      }).then(m => {
        return m.data
      })
  }
}
