// Mock data for the Profix dashboard
export const mockMonthlyMargin = [
  { month: "2024-01", revenue: 267300, costs: 150700, gop: 116600, gop_margin_pct: 43.62 },
  { month: "2024-02", revenue: 244700, costs: 128250, gop: 116450, gop_margin_pct: 47.59 },
  { month: "2024-03", revenue: 289100, costs: 168400, gop: 120700, gop_margin_pct: 41.75 },
  { month: "2024-04", revenue: 312500, costs: 181200, gop: 131300, gop_margin_pct: 42.02 },
  { month: "2024-05", revenue: 298700, costs: 179300, gop: 119400, gop_margin_pct: 39.97 },
  { month: "2024-06", revenue: 341200, costs: 192600, gop: 148600, gop_margin_pct: 43.55 },
  { month: "2024-07", revenue: 378400, costs: 208100, gop: 170300, gop_margin_pct: 45.0 },
  { month: "2024-08", revenue: 395200, costs: 225800, gop: 169400, gop_margin_pct: 42.86 },
  { month: "2024-09", revenue: 321600, costs: 198400, gop: 123200, gop_margin_pct: 38.31 },
  { month: "2024-10", revenue: 287300, costs: 192100, gop: 95200, gop_margin_pct: 33.14 },
  { month: "2024-11", revenue: 265400, costs: 159800, gop: 105600, gop_margin_pct: 39.79 },
  { month: "2024-12", revenue: 298900, costs: 170500, gop: 128400, gop_margin_pct: 42.96 },
];

export const mockCostDrivers = [
  { rank: 1, account_name: "Rooms Labor", department: "Rooms", amount: 38000, pct_of_total_cost: 25.22, delta_pct: 4.2 },
  { rank: 2, account_name: "F&B Labor", department: "Food & Beverage", amount: 22000, pct_of_total_cost: 14.60, delta_pct: -2.1 },
  { rank: 3, account_name: "F&B Cost of Sales", department: "Food & Beverage", amount: 21000, pct_of_total_cost: 13.93, delta_pct: 8.5 },
  { rank: 4, account_name: "Management Labor", department: "Administrative & General", amount: 15000, pct_of_total_cost: 9.95, delta_pct: 1.3 },
  { rank: 5, account_name: "Electricity", department: "Utilities", amount: 11200, pct_of_total_cost: 7.43, delta_pct: 38.2 },
];

export const mockDepartmentCosts = [
  { department: "Rooms", total: 48200, pct: 32.0 },
  { department: "Food & Beverage", total: 43000, pct: 28.5 },
  { department: "Administrative & General", total: 22400, pct: 14.9 },
  { department: "Utilities", total: 18700, pct: 12.4 },
  { department: "Sales & Marketing", total: 9800, pct: 6.5 },
  { department: "Property Operations", total: 8600, pct: 5.7 },
];

export const mockBreakeven = {
  breakeven_occupancy_pct: 62,
  current_occupancy_pct: 74,
  rooms_per_night_needed: 86,
  months_below: 2,
  total_months: 12,
};

export const mockKPIs = {
  total_revenue: 3509300,
  total_costs: 2055150,
  gop: 1454150,
  gop_margin_pct: 41.44,
  revenue_delta: 6.2,
  costs_delta: 3.8,
  gop_delta: 9.1,
  margin_delta: 1.2,
};
