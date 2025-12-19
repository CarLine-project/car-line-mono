export class ReceiptResultDto {
  amount: number;
  date: string;
  merchant?: string;
  category?: string;
  description?: string;
  confidence: number;
  needsReview: boolean;
}
