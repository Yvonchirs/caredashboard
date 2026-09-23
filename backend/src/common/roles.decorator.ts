import { Reflector } from '@nestjs/core';
import type { UserRole } from '../entities/index.js';

export const Roles = Reflector.createDecorator<UserRole[]>();
