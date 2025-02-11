import { ApiProperty } from '@nestjs/swagger'

export class CreateOperatorUser {
  @ApiProperty({ example: 'John', description: 'The first name of the user' })
    firstName: string

  @ApiProperty({ example: 'Doe', description: 'The last name of the user' })
    lastName: string

  @ApiProperty({ example: 'john.doe@gmail.com', description: 'The email of the user' })
    email: string

  @ApiProperty({ example: 'JohnDoe', description: 'The username of the user' })
    name: string

  @ApiProperty({ example: 'description', description: 'The description of the user' })
    description: string
}
