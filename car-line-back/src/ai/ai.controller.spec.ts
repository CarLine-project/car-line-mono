import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ProcessReceiptDto } from './dto/process-receipt.dto';
import { ReceiptResultDto } from './dto/receipt-result.dto';
import { CarsService } from '../cars/cars.service';

describe('AiController', () => {
  let controller: AiController;
  let aiService: AiService;

  const mockReceiptResult: ReceiptResultDto = {
    amount: 500,
    date: '2024-01-15',
    merchant: 'ОККО',
    category: 'fuel',
    description: 'Заправка А-95',
    confidence: 0.95,
    needsReview: false,
  };

  const mockAiService = {
    processReceipt: jest.fn(),
    getHealthStatus: jest.fn(),
  };

  const mockCarsService = {
    verifyOwnership: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: mockAiService,
        },
        {
          provide: CarsService,
          useValue: mockCarsService,
        },
      ],
    })
      .overrideGuard(
        require('../common/guards/car-ownership.guard').CarOwnershipGuard,
      )
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AiController>(AiController);
    aiService = module.get<AiService>(AiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processReceipt', () => {
    const processReceiptDto: ProcessReceiptDto = {
      image: 'base64encodedimage',
      carId: 'car-id-1',
    };

    const mockUser = {
      id: 'user-id-1',
      email: 'test@example.com',
    };

    it('should process a receipt successfully', async () => {
      mockAiService.processReceipt.mockResolvedValue(mockReceiptResult);

      const result = await controller.processReceipt(
        processReceiptDto,
        mockUser,
      );

      expect(result).toEqual(mockReceiptResult);
      expect(mockAiService.processReceipt).toHaveBeenCalledWith(
        processReceiptDto,
      );
    });

    it('should return result with low confidence', async () => {
      const lowConfidenceResult: ReceiptResultDto = {
        ...mockReceiptResult,
        confidence: 0.5,
        needsReview: true,
      };
      mockAiService.processReceipt.mockResolvedValue(lowConfidenceResult);

      const result = await controller.processReceipt(
        processReceiptDto,
        mockUser,
      );

      expect(result.needsReview).toBe(true);
      expect(result.confidence).toBe(0.5);
    });

    it('should handle receipt with partial data', async () => {
      const partialResult: ReceiptResultDto = {
        amount: 500,
        date: '2024-01-15',
        merchant: undefined,
        category: 'other',
        description: undefined,
        confidence: 0.7,
        needsReview: true,
      };
      mockAiService.processReceipt.mockResolvedValue(partialResult);

      const result = await controller.processReceipt(
        processReceiptDto,
        mockUser,
      );

      expect(result.merchant).toBeUndefined();
      expect(result.description).toBeUndefined();
      expect(result.needsReview).toBe(true);
    });
  });

  describe('getHealth', () => {
    it('should return health status when AI is configured', () => {
      const healthStatus = {
        status: 'available',
        configured: true,
      };
      mockAiService.getHealthStatus.mockReturnValue(healthStatus);

      const result = controller.getHealth();

      expect(result).toEqual(healthStatus);
      expect(result.configured).toBe(true);
      expect(mockAiService.getHealthStatus).toHaveBeenCalled();
    });

    it('should return health status when AI is not configured', () => {
      const healthStatus = {
        status: 'not_configured',
        configured: false,
      };
      mockAiService.getHealthStatus.mockReturnValue(healthStatus);

      const result = controller.getHealth();

      expect(result).toEqual(healthStatus);
      expect(result.configured).toBe(false);
    });
  });
});
