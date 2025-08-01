import { PartialType } from '@nestjs/mapped-types';
import { CreateProtectedAreaDto } from './create-protected-area.dto';

export class UpdateProtectedAreaDto extends PartialType(
  CreateProtectedAreaDto,
) {}
