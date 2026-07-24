export type SageToken = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: "Bearer" | string;
  scope?: string;
};

export type SageBusiness = { id: string; name: string; country?: string };
export type SageProduct = { id: string; item_code?: string; product_code?: string; description?: string; sales_price?: number | string; sales_price_includes_tax?: boolean };
export type SageInvoiceLine = { description: string; quantity: number; unit_price: number; product_id?: string; ledger_account_id?: string; tax_rate_id?: string };
export type SageInvoiceInput = { contact_id: string; date: string; due_date?: string; reference?: string; notes?: string; invoice_lines: SageInvoiceLine[] };
export type SageResource<T> = { $totalResults?: number; $startIndex?: number; $itemsPerPage?: number; $resources?: T[]; $items?: T[] };
