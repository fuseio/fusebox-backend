import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { lastValueFrom, map } from 'rxjs'

@Injectable()
export default class GraphQLService {
  constructor (
    private readonly httpService: HttpService
  ) { }

  async fetchFromGraphQL (graphApiUrl, query, variables) {
    const observable = this.httpService
      .post(graphApiUrl, { query, variables })
      .pipe(map(res => res.data))
    return await lastValueFrom(observable)
  }
}
