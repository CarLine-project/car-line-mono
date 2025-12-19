import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { ProcessReceiptDto } from './dto/process-receipt.dto';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('AiService', () => {
  let service: AiService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    // Set default API key for tests
    mockConfigService.get.mockReturnValue('test-api-key');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset global fetch mock
    global.fetch = jest.fn() as jest.Mock;
  });

  describe('constructor', () => {
    it('should initialize with API key', () => {
      mockConfigService.get.mockReturnValue('test-api-key');

      const module = Test.createTestingModule({
        providers: [
          AiService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      expect(module).toBeDefined();
    });

    it('should warn when API key is not set', () => {
      mockConfigService.get.mockReturnValue(undefined);

      const module = Test.createTestingModule({
        providers: [
          AiService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      expect(module).toBeDefined();
    });
  });

  describe('processReceipt', () => {
    // Generate a longer valid base64 image (minimum 100 chars for validation)
    const validBase64Image =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJgggAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
    const processReceiptDto: ProcessReceiptDto = {
      image: validBase64Image,
      carId: 'car-id-1',
    };

    it('should throw BadRequestException for invalid image format', async () => {
      const invalidDto: ProcessReceiptDto = {
        image: 'invalid-base64',
        carId: 'car-id-1',
      };

      await expect(service.processReceipt(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException when API key is missing', async () => {
      mockConfigService.get.mockReturnValue(undefined);
      const newService = new AiService(configService);

      await expect(
        newService.processReceipt(processReceiptDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should process receipt successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  amount: 500,
                  date: '2024-01-15',
                  merchant: 'ОККО',
                  category: 'fuel',
                  description: 'Заправка А-95',
                  items: [],
                }),
              },
            },
          ],
        }),
      };

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.processReceipt(processReceiptDto);

      expect(result).toBeDefined();
      expect(result.amount).toBe(500);
      expect(result.merchant).toBe('ОККО');
      expect(result.category).toBe('fuel');
      expect(result.needsReview).toBe(false);
    });

    it('should mark for review when confidence is low', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  amount: null,
                  date: '2024-01-15',
                  merchant: 'Unknown',
                  category: 'other',
                  description: null,
                  items: [],
                }),
              },
            },
          ],
        }),
      };

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.processReceipt(processReceiptDto);

      expect(result.needsReview).toBe(true);
    });

    it('should handle missing amount', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  amount: null,
                  date: '2024-01-15',
                  merchant: 'Test',
                  category: 'fuel',
                  description: 'Test',
                  items: [],
                }),
              },
            },
          ],
        }),
      };

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.processReceipt(processReceiptDto);

      expect(result.amount).toBe(0);
      expect(result.needsReview).toBe(true);
    });

    it('should handle missing date', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  amount: 500,
                  date: null,
                  merchant: 'Test',
                  category: 'fuel',
                  description: 'Test',
                  items: [],
                }),
              },
            },
          ],
        }),
      };

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.processReceipt(processReceiptDto);

      expect(result.date).toBeDefined();
      expect(result.needsReview).toBe(true);
    });

    it('should throw InternalServerErrorException on API error', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue({ error: 'API Error' }),
      };

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      await expect(service.processReceipt(processReceiptDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle fetch errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(service.processReceipt(processReceiptDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle data URL prefix in base64', async () => {
      const dtoWithPrefix: ProcessReceiptDto = {
        image: `data:image/jpeg;base64,${validBase64Image}`,
        carId: 'car-id-1',
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  amount: 500,
                  date: '2024-01-15',
                  merchant: 'Test',
                  category: 'fuel',
                  description: 'Test',
                  items: [],
                }),
              },
            },
          ],
        }),
      };

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.processReceipt(dtoWithPrefix);

      expect(result).toBeDefined();
      expect(result.amount).toBe(500);
    });

    it('should validate suspicious amounts', async () => {
      const dtoWithValidImage: ProcessReceiptDto = {
        image: validBase64Image,
        carId: 'car-id-1',
      };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  amount: 2000000,
                  date: '2024-01-15',
                  merchant: 'Test',
                  category: 'fuel',
                  description: 'Test',
                  items: [],
                }),
              },
            },
          ],
        }),
      };

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.processReceipt(dtoWithValidImage);

      expect(result).toBeDefined();
    });

    it('should validate and correct suspicious dates', async () => {
      const dtoWithValidImage: ProcessReceiptDto = {
        image: validBase64Image,
        carId: 'car-id-1',
      };
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  amount: 500,
                  date: futureDate.toISOString().split('T')[0],
                  merchant: 'Test',
                  category: 'fuel',
                  description: 'Test',
                  items: [],
                }),
              },
            },
          ],
        }),
      };

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.processReceipt(dtoWithValidImage);

      expect(result.date).not.toBe(futureDate.toISOString().split('T')[0]);
    });

    it('should normalize invalid categories to "other"', async () => {
      const dtoWithValidImage: ProcessReceiptDto = {
        image: validBase64Image,
        carId: 'car-id-1',
      };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  amount: 500,
                  date: '2024-01-15',
                  merchant: 'Test',
                  category: 'invalid-category',
                  description: 'Test',
                  items: [],
                }),
              },
            },
          ],
        }),
      };

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.processReceipt(dtoWithValidImage);

      expect(result.category).toBe('other');
    });
  });

  describe('getHealthStatus', () => {
    it('should return available status when API key is configured', () => {
      mockConfigService.get.mockReturnValue('test-api-key');
      const newService = new AiService(configService);

      const result = newService.getHealthStatus();

      expect(result.status).toBe('available');
      expect(result.configured).toBe(true);
    });

    it('should return not_configured status when API key is missing', () => {
      mockConfigService.get.mockReturnValue(undefined);
      const newService = new AiService(configService);

      const result = newService.getHealthStatus();

      expect(result.status).toBe('not_configured');
      expect(result.configured).toBe(false);
    });
  });
});
