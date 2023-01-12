import { IsEmail, MinLength, Matches } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @MinLength(8, { message: " The min length of password is 8 " })
  @Matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
      { message: " A password at least contains one numeric digit, one special char, one lowercase char and one uppercase char" }
  )
  password: string;
}
