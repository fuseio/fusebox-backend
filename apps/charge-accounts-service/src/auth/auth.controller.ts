import { Body, Controller, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { CreateUserDto } from '@app/accounts-service/users/dto/create-user.dto'
import { User } from '@app/accounts-service/users/user.decorator'
import { UsersService } from '@app/accounts-service/users/users.service'
import { JwtAuthGuard } from '@app/accounts-service/auth/guards/jwt-auth.guard'
import { AuthService } from '@app/accounts-service/auth/auth.service'
import { AuthOperatorDto } from '@app/accounts-service/auth/dto/auth-operator.dto'

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor (
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}

  /**
   * Registers a new user for the authenticated user
   * @param createUserDto
   */
  @UseGuards(JwtAuthGuard)
  @Post('/register')
  create (@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  /**
   *
   * @param id Logs in the authenticated user's auth0Id and returns the user id in our db
   */
  @UseGuards(JwtAuthGuard)
  @Post('/login')
  async findOne (@User('sub') id: string) {
    console.log(id)
    const user = await this.usersService.findOneByAuth0Id(id)
    return { id: user?.id }
  }


  /**
   * Validate operator
   * @param authOperatorDto
   */
  @Post('/validate')
  validate (@Body() authOperatorDto: AuthOperatorDto) {    
    const recoveredAddress = this.authService.verifySignature(authOperatorDto)

    if(authOperatorDto.externallyOwnedAccountAddress !== recoveredAddress) {
      throw new HttpException('Wallet ownership verification failed', HttpStatus.FORBIDDEN);
    }
    
    return this.authService.createJwt(recoveredAddress)
  }
}
