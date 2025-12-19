export interface ExtractedReceiptData {
  amount?: number;
  date?: string;
  merchant?: string;
  category?: string;
  description?: string;
  items?: Array<{
    name: string;
    quantity?: number;
    price?: number;
  }>;
}

export interface AIResponse {
  data: ExtractedReceiptData;
  confidence: number;
  rawText?: string;
}
