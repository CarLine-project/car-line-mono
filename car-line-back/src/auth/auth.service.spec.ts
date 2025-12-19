import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from '../users/entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let refreshTokenRepository: Repository<RefreshToken>;

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

  const mockRefreshToken: RefreshToken = {
    id: 'token-id-1',
    token: 'refresh-token-123',
    userId: 'user-id-1',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    user: mockUser,
    createdAt: new Date(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    validatePassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        JWT_SECRET: 'test-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };
      return config[key];
    }),
  };

  const mockRefreshTokenRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRefreshTokenRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    refreshTokenRepository = module.get<Repository<RefreshToken>>(
      getRepositoryToken(RefreshToken),
    );
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

    it('should register a new user successfully', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      mockRefreshTokenRepository.create.mockReturnValue(mockRefreshToken);
      mockRefreshTokenRepository.save.mockResolvedValue(mockRefreshToken);
      mockRefreshTokenRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('refreshTokens');
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(mockUsersService.create).toHaveBeenCalledWith(registerDto);
    });

    it('should throw ConflictException if user already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(mockUsersService.create).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123',
      );
    });

    it('should return null if user does not exist', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toBeNull();
      expect(mockUsersService.validatePassword).not.toHaveBeenCalled();
    });

    it('should return null if password is invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrong-password',
      );

      expect(result).toBeNull();
      expect(mockUsersService.validatePassword).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      mockRefreshTokenRepository.create.mockReturnValue(mockRefreshToken);
      mockRefreshTokenRepository.save.mockResolvedValue(mockRefreshToken);
      mockRefreshTokenRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    it('should refresh tokens successfully', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const validToken: RefreshToken = {
        ...mockRefreshToken,
        expiresAt: futureDate,
      };

      mockRefreshTokenRepository.findOne.mockResolvedValue(validToken);
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');
      mockRefreshTokenRepository.create.mockReturnValue(mockRefreshToken);
      mockRefreshTokenRepository.save.mockResolvedValue(mockRefreshToken);
      mockRefreshTokenRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await service.refresh('refresh-token-123', 'user-id-1');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(mockRefreshTokenRepository.remove).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      mockRefreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(
        service.refresh('invalid-token', 'user-id-1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if refresh token is expired', async () => {
      const pastDate = new Date(Date.now() - 1000);
      const expiredToken: RefreshToken = {
        ...mockRefreshToken,
        expiresAt: pastDate,
      };

      mockRefreshTokenRepository.findOne.mockResolvedValue(expiredToken);

      await expect(
        service.refresh('expired-token', 'user-id-1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token does not match user', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const validToken: RefreshToken = {
        ...mockRefreshToken,
        expiresAt: futureDate,
        userId: 'different-user-id',
      };

      mockRefreshTokenRepository.findOne.mockResolvedValue(validToken);

      await expect(
        service.refresh('refresh-token-123', 'user-id-1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const validToken: RefreshToken = {
        ...mockRefreshToken,
        expiresAt: futureDate,
      };

      mockRefreshTokenRepository.findOne.mockResolvedValue(validToken);
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(
        service.refresh('refresh-token-123', 'user-id-1'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should remove refresh token on logout', async () => {
      mockRefreshTokenRepository.findOne.mockResolvedValue(mockRefreshToken);

      await service.logout('refresh-token-123');

      expect(mockRefreshTokenRepository.findOne).toHaveBeenCalledWith({
        where: { token: 'refresh-token-123' },
      });
      expect(mockRefreshTokenRepository.remove).toHaveBeenCalledWith(
        mockRefreshToken,
      );
    });

    it('should not throw error if token does not exist', async () => {
      mockRefreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.logout('non-existent-token')).resolves.not.toThrow();
      expect(mockRefreshTokenRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserById('user-id-1');

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('user-id-1');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.getUserById('non-existent-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('sanitizeUser', () => {
    it('should remove password and refreshTokens from user object', () => {
      const result = service.sanitizeUser(mockUser);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('refreshTokens');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
    });
  });
});
