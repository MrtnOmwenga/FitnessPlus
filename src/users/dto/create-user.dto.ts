import { IsString, IsEmail, IsNumber, IsPositive, IsBoolean, IsDateString, IsDate, IsNotEmpty, Min } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'First name must not be empty' })
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsNotEmpty({ message: 'Membership type must not be empty' })
  membershipType: string; // e.g., 'Annual Basic', 'Monthly Premium'

  @IsDateString()
  startDate: string = new Date().toISOString();

  @IsDate({ message: 'Invalid due date format. Please provide a valid due date string' })
  dueDate: Date = new Date(new Date().setFullYear(new Date().getFullYear() + 1)); // For annual memberships

  @IsDate({ message: 'Invalid monthly due date format. Please provide a valid monthly due date string' })
  monthlyDueDate: Date = new Date(new Date().setMonth(new Date().getMonth() + 1)); // For add-on services

  @IsNumber({}, { message: 'Total amount must be a number' })
  @IsPositive({ message: 'Total amount must be a positive number' })
  totalAmount: number; // For annual memberships

  @IsNumber({}, { message: 'Monthly amount must be a number' })
  @Min(0, { message: 'Monthly amount must be a positive number'})
  monthlyAmount: number = 0; // For add-on services

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsBoolean()
  isFirstMonth: boolean = true;

  @IsString()
  invoiceLink: string;
}
