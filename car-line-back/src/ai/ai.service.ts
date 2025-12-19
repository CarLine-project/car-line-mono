import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProcessReceiptDto } from './dto/process-receipt.dto';
import { ReceiptResultDto } from './dto/receipt-result.dto';
import {
  ExtractedReceiptData,
  AIResponse,
} from './interfaces/extracted-data.interface';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openaiApiKey: string | undefined;
  private readonly openaiApiUrl = 'https://api.openai.com/v1/chat/completions';
  private readonly confidenceThreshold = 0.8;

  constructor(private configService: ConfigService) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!this.openaiApiKey) {
      this.logger.warn(
        'OPENAI_API_KEY is not set. AI features will be disabled.',
      );
    }
  }

  async processReceipt(
    processReceiptDto: ProcessReceiptDto,
  ): Promise<ReceiptResultDto> {
    const { image, carId } = processReceiptDto;

    // Validate image format
    if (!this.isValidBase64Image(image)) {
      throw new BadRequestException(
        'Invalid image format. Please provide a valid base64 encoded image.',
      );
    }

    // Check API key
    if (!this.openaiApiKey) {
      throw new InternalServerErrorException(
        'AI service is not configured. Please contact administrator.',
      );
    }

    try {
      // Process image with GPT-4 Vision
      const aiResponse = await this.analyzeReceiptWithGPT4Vision(image);

      // Validate extracted data
      const validatedData = this.validateExtractedData(aiResponse.data);

      // Determine if needs review
      const needsReview =
        aiResponse.confidence < this.confidenceThreshold ||
        !validatedData.amount ||
        !validatedData.date;

      return {
        amount: validatedData.amount || 0,
        date: validatedData.date || new Date().toISOString().split('T')[0],
        merchant: validatedData.merchant,
        category: validatedData.category || 'other',
        description: validatedData.description,
        confidence: aiResponse.confidence,
        needsReview,
      };
    } catch (error) {
      this.logger.error(
        `Error processing receipt: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to process receipt. Please try again or enter data manually.',
      );
    }
  }

  private async analyzeReceiptWithGPT4Vision(
    base64Image: string,
  ): Promise<AIResponse> {
    const prompt = `Analyze this receipt image and extract the following information in JSON format:
{
  "amount": number (total amount),
  "date": "YYYY-MM-DD" format,
  "merchant": string (store/company name),
  "category": string (one of: "fuel", "maintenance", "carwash", "parts", "insurance", "other"),
  "description": string (brief description),
  "items": array of items if visible
}

Important:
- Return only valid JSON
- If you can't find a field, use null
- For amount, use the total (not including change)
- Guess the most likely category based on merchant/items
- Be confident in your extraction`;

    try {
      const response = await fetch(this.openaiApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Using gpt-4o-mini for vision (cheaper and faster)
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${this.cleanBase64(base64Image)}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
          temperature: 0.2, // Low temperature for more consistent results
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        this.logger.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      // Extract JSON from response (GPT might add markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from response');
      }

      const extractedData: ExtractedReceiptData = JSON.parse(jsonMatch[0]);

      // Calculate confidence based on completeness
      const confidence = this.calculateConfidence(extractedData);

      return {
        data: extractedData,
        confidence,
        rawText: content,
      };
    } catch (error) {
      this.logger.error(`GPT-4 Vision API error: ${error.message}`);
      throw error;
    }
  }

  private validateExtractedData(
    data: ExtractedReceiptData,
  ): ExtractedReceiptData {
    const validated = { ...data };

    // Validate amount
    if (
      validated.amount &&
      (validated.amount <= 0 || validated.amount > 1000000)
    ) {
      this.logger.warn(`Suspicious amount detected: ${validated.amount}`);
    }

    // Validate date
    if (validated.date) {
      const date = new Date(validated.date);
      const now = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);

      if (date > now || date < oneYearAgo) {
        this.logger.warn(`Suspicious date detected: ${validated.date}`);
        validated.date = now.toISOString().split('T')[0];
      }
    }

    // Validate category
    const validCategories = [
      'fuel',
      'maintenance',
      'carwash',
      'parts',
      'insurance',
      'other',
    ];
    if (validated.category && !validCategories.includes(validated.category)) {
      validated.category = 'other';
    }

    return validated;
  }

  private calculateConfidence(data: ExtractedReceiptData): number {
    let confidence = 0;
    let totalFields = 0;

    // Amount (most important - 40%)
    if (data.amount && data.amount > 0) {
      confidence += 0.4;
    }
    totalFields++;

    // Date (30%)
    if (data.date) {
      confidence += 0.3;
    }
    totalFields++;

    // Merchant (15%)
    if (data.merchant) {
      confidence += 0.15;
    }
    totalFields++;

    // Category (10%)
    if (data.category) {
      confidence += 0.1;
    }
    totalFields++;

    // Description or items (5%)
    if (data.description || (data.items && data.items.length > 0)) {
      confidence += 0.05;
    }
    totalFields++;

    return Math.min(confidence, 1.0);
  }

  private isValidBase64Image(base64String: string): boolean {
    // Remove data URL prefix if present
    const cleanBase64 = this.cleanBase64(base64String);

    // Check if it's valid base64
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(cleanBase64)) {
      return false;
    }

    // Check minimum length (at least 100 bytes for a small image)
    if (cleanBase64.length < 100) {
      return false;
    }

    return true;
  }

  private cleanBase64(base64String: string): string {
    // Remove data URL prefix if present
    return base64String.replace(/^data:image\/[a-z]+;base64,/, '');
  }

  getHealthStatus(): { status: string; configured: boolean } {
    return {
      status: this.openaiApiKey ? 'available' : 'not_configured',
      configured: !!this.openaiApiKey,
    };
  }
}
