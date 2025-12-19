import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

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

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return user if found', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('user-id-1');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
      });
    });

    it('should return null if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user if found by email', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const userData = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
    };

    it('should create a new user with hashed password', async () => {
      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const createdUser = {
        ...mockUser,
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
      };

      mockRepository.create.mockReturnValue(createdUser);
      mockRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(userData);

      expect(result).toEqual(createdUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...userData,
        password: hashedPassword,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(createdUser);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateData };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update('user-id-1', updateData);

      expect(result).toEqual(updatedUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('validatePassword', () => {
    it('should return true if password matches', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword(
        'password123',
        'hashedPassword123',
      );

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123',
      );
    });

    it('should return false if password does not match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword(
        'wrongPassword',
        'hashedPassword123',
      );

      expect(result).toBe(false);
    });
  });
});
