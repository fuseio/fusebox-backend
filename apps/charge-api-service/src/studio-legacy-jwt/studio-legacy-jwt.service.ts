import { HttpService } from '@nestjs/axios'
import { HttpException, Injectable } from '@nestjs/common'
import { catchError, lastValueFrom, map } from 'rxjs'
import * as CryptoJS from 'crypto-js'

@Injectable()
export class StudioLegacyJwtService {
  constructor (private httpService: HttpService) { }

  async createLegacyJwt (
    appName = 'chargeApp'
  ): Promise<Record<string, any>> {
    const requestBody = {
      role: 'communityAdmin',
      bridgeType: 'home',
      description: appName,
      appName
    }

    const responseData = await lastValueFrom(
      this.httpService
        .post(
          `${process.env.LEGACY_FUSE_ADMIN_API_URL}/api/v2/accounts/`,
          requestBody
        )
        .pipe(
          map((response) => {
            return response.data
          })
        )
        .pipe(
          catchError(e => {
            throw new HttpException(
              `${e?.response?.statusText}: ${e?.response?.data?.error}`,
              e?.response?.status
            )
          })
        )
    )

    const legacyJwt = responseData?.data?.jwt
    const legacyBackendAccount = responseData?.data?.account?.address

    const encryptedLegacyJwt = CryptoJS.AES.encrypt(legacyJwt, process.env.LEGACY_JWT_SECRET).toString()

    return { encryptedLegacyJwt, legacyBackendAccount }
  }

  // To be used internally when requests will be forwarded to the Legacy Admin API
  async decryptEncryptedJWT (encryptedJwt: string): Promise<string> {
    const decrypted = CryptoJS.AES.decrypt(encryptedJwt, process.env.LEGACY_JWT_SECRET)

    return decrypted.toString(CryptoJS.enc.Utf8)
  }
}
