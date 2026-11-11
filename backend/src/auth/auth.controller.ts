import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CurrentUser } from '../common/current-user.decorator.js';
import { serializeUser } from '../common/serializers.js';
import type { User } from '../entities/index.js';
import { UserDto } from '../users/users.dto.js';
import { ChangePasswordDto, ForgotPasswordDto, LoginDto, LoginResponseDto, ResetPasswordDto } from './auth.dto.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { PasswordResetService } from './password-reset.service.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly passwordReset: PasswordResetService,
  ) {}

  @Post('login')
  @HttpCode(200)
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials or inactive account' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('forgot-password')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Email a password reset link',
    description: 'Always returns 204, whether or not the email belongs to an active account, so it cannot be used to discover accounts.',
  })
  @ApiNoContentResponse()
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.passwordReset.forgot(dto.email);
  }

  @Post('reset-password')
  @HttpCode(204)
  @ApiOperation({ summary: 'Choose a new password with the token from an emailed link' })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ description: 'Invalid or expired link' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.passwordReset.reset(dto.token, dto.newPassword);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserDto })
  me(@CurrentUser() user: User) {
    return serializeUser(user);
  }

  @Post('change-password')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserDto })
  changePassword(@CurrentUser() user: User, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(user, dto.currentPassword, dto.newPassword);
  }
}
