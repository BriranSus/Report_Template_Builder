import type { MockDataRow, TemplateColumn } from '../types';

const PLANTS = ['MDN','PDG','LPG','BLI','CRB','SMG','SBY','MKS','TOTAL FM','GTO','BMA','TOTAL'];
const DATES_A = ['01 Mar','15 Mar','22 Mar','01 Apr','10 Apr','25 Apr'];
const DATES_B = ['14 Apr','06 May','28 Apr','23 Apr','19 Apr','20 Apr'];

const rnd = (min: number, max: number, decimals = 3): number =>
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

const BASE_DATA: MockDataRow = {};

// Pre-seed all known keys so the table has real numbers for built-in columns
const buildBase = (): MockDataRow => ({
  plant: '',
  material: 'Grains',
  report_date: DATES_A[Math.floor(Math.random() * DATES_A.length)],
  corn_stock:   rnd(10000, 60000, 3), corn_map: rnd(6.0, 7.5, 3), corn_doh: Math.floor(rnd(25, 70)),
  wheat_stock:  rnd(5000, 30000, 3),  wheat_map: rnd(6.0, 7.0, 3), wheat_doh: Math.floor(rnd(25, 70)),
  soh_total:    rnd(15000, 80000, 3), soh_map: rnd(6.0, 7.5, 3), soh_doh: Math.floor(rnd(25, 70)),
  soh_date:     DATES_A[Math.floor(Math.random() * DATES_A.length)], soh_pct: Math.floor(rnd(30, 90)) + '%',
  od_corn:        rnd(1000, 20000, 3), od_corn_price: rnd(6.0, 7.0, 3),
  od_wheat:       rnd(1000, 15000, 3), od_wheat_price: rnd(5.8, 6.8, 3),
  od_total:       rnd(5000, 30000, 3), od_price: rnd(6.0, 7.0, 3),
  ebs_corn:      rnd(10000, 60000, 3), ebs_corn_map: rnd(6.0, 7.5, 3),
  ebs_wheat:     rnd(5000, 30000, 3),  ebs_wheat_map: rnd(5.8, 6.8, 3),
  ebs_total:     rnd(20000, 100000, 3), ebs_map: rnd(6.0, 7.5, 3), ebs_doh: Math.floor(rnd(30, 80)),
  gp_plan:    rnd(20000, 50000, 3), gp_real: rnd(18000, 45000, 3), gp_balance: rnd(1000, 10000, 3),
  today_purchase: Math.floor(rnd(50, 500)),
  ees_corn:      rnd(10000, 60000, 3), ees_corn_map: rnd(6.0, 7.5, 3),
  ees_wheat:     rnd(5000, 30000, 3),  ees_wheat_map: rnd(5.8, 6.8, 3),
  ees_total:     rnd(20000, 100000, 3), ees_map: rnd(6.0, 7.5, 3), ees_doh: Math.floor(rnd(30, 80)),
  ees_date:      DATES_B[Math.floor(Math.random() * DATES_B.length)],
  mkt_corn: rnd(6.0, 7.5, 3), mkt_wheat: rnd(5.8, 6.8, 3),
  lp_corn:  rnd(6.0, 7.5, 3), lp_wheat:  rnd(5.8, 6.8, 3),
  ca7_receive: Math.floor(rnd(500, 12000)), ca7_usage: Math.floor(rnd(500, 12000)), ca7_pct: Math.floor(rnd(60, 120)) + '%',
  wa7_receive: Math.floor(rnd(0, 5000)),   wa7_usage: Math.floor(rnd(0, 5000)),
  ta7_receive: Math.floor(rnd(1000, 15000)), ta7_usage: Math.floor(rnd(1000, 15000)),
  ua14_total: Math.floor(rnd(5000, 15000)), ua14_doh_end: Math.floor(rnd(30, 80)),
  // Plant sub-columns
  mdn_total_receive: Math.floor(rnd(1000, 20000)), mdn_usage: Math.floor(rnd(500, 15000)), mdn_balance: 0,
  pdg_total_receive: Math.floor(rnd(1000, 20000)), pdg_usage: Math.floor(rnd(500, 15000)), pdg_balance: 0,
  lpg_total_receive: Math.floor(rnd(1000, 20000)), lpg_usage: Math.floor(rnd(500, 15000)), lpg_balance: 0,
  blr_total_receive: Math.floor(rnd(1000, 20000)), blr_usage: Math.floor(rnd(500, 15000)), blr_balance: 0,
  crb_total_receive: Math.floor(rnd(1000, 20000)), crb_usage: Math.floor(rnd(500, 15000)), crb_balance: 0,
  smg_total_receive: Math.floor(rnd(1000, 20000)), smg_usage: Math.floor(rnd(500, 15000)), smg_balance: 0,
});

export const generateMockData = (): MockDataRow[] =>
  PLANTS.map((plant) => {
    const row = buildBase();
    row.plant = plant;
    // Compute balance = total_receive - usage for plant columns
    for (const prefix of ['mdn','pdg','lpg','blr','crb','smg']) {
      const tr = Number(row[`${prefix}_total_receive`] ?? 0);
      const us = Number(row[`${prefix}_usage`] ?? 0);
      row[`${prefix}_balance`] = tr - us;
    }
    return row;
  });

/**
 * Resolve a cell value for a given key and row.
 * If the column has a formula, evaluate it using other row values as variables.
 * If no backend data exists (value is undefined), returns null so the table can show '-' or formula result.
 */
export const resolveValue = (
  key: string,
  formula: string | undefined,
  row: MockDataRow
): string | number | null => {
  // If formula is defined, evaluate it
  if (formula && formula.trim()) {
    try {
      // Build a safe scope from all row keys
      const scope = { ...row };
      // eslint-disable-next-line no-new-func
      const fn = new Function(...Object.keys(scope), `return (${formula});`);
      const result = fn(...Object.values(scope));
      if (typeof result === 'number') return parseFloat(result.toFixed(3));
      return String(result);
    } catch {
      return 'ERR';
    }
  }

  const val = row[key];
  if (val === undefined || val === null) return null;
  return val;
};
