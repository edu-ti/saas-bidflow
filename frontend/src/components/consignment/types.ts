export interface Consignee {
  id: number;
  name: string;
  document: string | null;
  credit_limit: string;
  commission_rate: string;
  address: string | null;
  active: boolean;
}

export interface Product {
  id: number;
  name: string;
  sku: string | null;
  base_price: string;
  stock: number;
}

export interface ConsignmentItem {
  id: number;
  consignment_id: number;
  product_id: number;
  qty_sent: number;
  qty_returned: number;
  qty_sold: number;
  agreed_unit_price: string;
  product?: Product;
}

export interface ConsignmentRecord {
  id: number;
  consignee_id: number;
  user_id: number;
  status: 'active' | 'closed';
  total_value: string;
  issue_date: string | null;
  due_date: string | null;
  notes: string | null;
  consignee?: Consignee;
  user?: { id: number; name: string };
  items: ConsignmentItem[];
}

export interface DashboardStats {
  total_active_value: number;
  pending_reconcile_count: number;
  total_closed_count: number;
}

export interface WizardItem {
  product_id: number;
  qty_sent: number;
  agreed_unit_price: number;
  productName?: string;
  stock?: number;
}

export interface ReconcileItem {
  item_id: number;
  qty_sold: number;
  qty_returned: number;
}

export const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo/Na Rua',
  closed: 'Fechado/Faturado',
};

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  closed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

export function fmt(value: string | number | null) {
  if (!value && value !== 0) return 'R$ 0,00';
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function fmtDate(d: string | null) {
  if (!d) return '-';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}
