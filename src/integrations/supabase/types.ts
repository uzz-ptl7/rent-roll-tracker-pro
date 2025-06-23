export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: number;
          customerName: string;
          paymentDate: string; // or Date if you cast
          monthPaidFor: string;
          paymentMethod: 'cash' | 'mobilemoney';
          amount: number;
          momoTransactionId?: string | null;
        };
        Insert: {
          customerName: string;
          paymentDate: string;
          monthPaidFor: string;
          paymentMethod: 'cash' | 'mobilemoney';
          amount: number;
          momoTransactionId?: string | null;
        };
        Update: {
          customerName?: string;
          paymentDate?: string;
          monthPaidFor?: string;
          paymentMethod?: 'cash' | 'mobilemoney';
          amount?: number;
          momoTransactionId?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};
