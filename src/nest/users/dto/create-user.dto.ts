import { IsEmail, MinLength, Matches, MaxLength } from 'class-validator';
export class CreateUserDto{
  @IsEmail()
  email: string;

  @MaxLength(30, { message: 'The max length of name is 30'})
  name: string;

  @MinLength(8, { message: " The min length of password is 8 " })
  @Matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
      { message: " A password at least contains one numeric digit, one special char(eg: !@#$%^&*), one lowercase char and one uppercase char" }
  )
  password: string;
}
