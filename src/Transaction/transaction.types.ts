export interface TransactionBody {
  type: "DEBIT" | "CREDIT";
  property_id: number;
  description: string;
  amount: number;
}
export interface ReportData {
  propertyId: number;
  propertyName: string;
  income: number;
  expenses: number;
  agencyCommission: number;
  finalAmount: number;
  data: {
    id: number;
    propertyId: number;
    type: string;
    description: string;
    amount: number;
    created_at: string;
  }[];
}
