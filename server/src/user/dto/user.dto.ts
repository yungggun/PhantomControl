import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @Matches(/[0-9]/)
  @Matches(/[A-Z]/)
  @Matches(/[^a-zA-Z0-9]/)
  readonly password: string;
}

export class GetUserDataFromTokenDto {
  @IsString()
  @IsNotEmpty()
  readonly token: string;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly username: string;
}
