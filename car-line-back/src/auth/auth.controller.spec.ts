import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { RefreshTokenPayload } from './interfaces/jwt-payload.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser: User = {
    id: 'user-id-1',
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'Test User',
    phone: null,
    avatar: null,
    role: null,
    refreshTokens: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthResponse = {
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-123',
    user: {
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      phone: mockUser.phone,
      avatar: mockUser.avatar,
      role: mockUser.role,
      createdAt: mockUser.createdAt,
      updatedAt: mockUser.updatedAt,
    },
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    generateTokensForUser: jest.fn(),
    sanitizeUser: jest.fn(),
    getUserById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should register a new user', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockAuthResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login user and return tokens', async () => {
      const tokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
      };
      const sanitizedUser = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        phone: mockUser.phone,
        avatar: mockUser.avatar,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      mockAuthService.generateTokensForUser.mockResolvedValue(tokens);
      mockAuthService.sanitizeUser.mockReturnValue(sanitizedUser);

      const result = await controller.login(mockUser);

      expect(result).toEqual({
        ...tokens,
        user: sanitizedUser,
      });
      expect(mockAuthService.generateTokensForUser).toHaveBeenCalledWith(
        mockUser,
      );
      expect(mockAuthService.sanitizeUser).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('refresh', () => {
    const refreshTokenPayload: RefreshTokenPayload = {
      userId: 'user-id-1',
      email: 'test@example.com',
      refreshToken: 'refresh-token-123',
    };

    it('should refresh tokens successfully', async () => {
      mockAuthService.refresh.mockResolvedValue(mockAuthResponse);

      const result = await controller.refresh(refreshTokenPayload);

      expect(result).toEqual(mockAuthResponse);
      expect(mockAuthService.refresh).toHaveBeenCalledWith(
        refreshTokenPayload.refreshToken,
        refreshTokenPayload.userId,
      );
    });

    it('should throw error if refresh fails', async () => {
      mockAuthService.refresh.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      );

      await expect(controller.refresh(refreshTokenPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'refresh-token-123',
    };

    it('should logout user successfully', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(refreshTokenDto);

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(mockAuthService.logout).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const fullUser = { ...mockUser };
      const sanitizedUser = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        phone: mockUser.phone,
        avatar: mockUser.avatar,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      mockAuthService.getUserById.mockResolvedValue(fullUser);
      mockAuthService.sanitizeUser.mockReturnValue(sanitizedUser);

      const result = await controller.getProfile(mockUser);

      expect(result).toEqual(sanitizedUser);
      expect(mockAuthService.getUserById).toHaveBeenCalledWith(mockUser.id);
      expect(mockAuthService.sanitizeUser).toHaveBeenCalledWith(fullUser);
    });
  });
});
