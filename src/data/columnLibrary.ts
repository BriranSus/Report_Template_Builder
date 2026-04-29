import type { LibraryGroup } from '../types';

export const COLUMN_LIBRARY: LibraryGroup[] = [
  {
    group: 'Basic',
    items: [
      { id: 'plant', label: 'PLANT', type: 'basic' },
      { id: 'material', label: 'MATERIAL', type: 'basic' },
    ],
  },
  {
    group: 'Material Columns',
    items: [
      {
        id: 'corn', label: 'CORN', type: 'group',
        children: [
          { id: 'corn_stock', label: 'STOCK' },
          { id: 'corn_map', label: 'MAP' },
          { id: 'corn_doh', label: 'DOH' },
        ],
      },
      {
        id: 'wheat', label: 'WHEAT', type: 'group',
        children: [
          { id: 'wheat_stock', label: 'STOCK' },
          { id: 'wheat_map', label: 'MAP' },
          { id: 'wheat_doh', label: 'DOH' },
        ],
      },
    ],
  },
  {
    group: 'Stock On Hand',
    items: [
      {
        id: 'stock_on_hand', label: 'STOCK ON HAND GRAINS', type: 'group',
        children: [
          { id: 'soh_total', label: 'TOTAL' },
          { id: 'soh_map', label: 'MAP' },
          { id: 'soh_doh', label: 'DOH' },
          { id: 'soh_date', label: 'DATE' },
          { id: 'soh_pct', label: '% CAP.' },
        ],
      },
    ],
  },
  {
    group: 'On Delivery This Month',
    items: [
      {
        id: 'on_delivery', label: 'ON DELIVERY THIS MONTH', type: 'group',
        children: [
          { id: 'od_corn', label: 'CORN' },
          { id: 'od_corn_price', label: 'PRICE' },
          { id: 'od_wheat', label: 'WHEAT' },
          { id: 'od_wheat_price', label: 'PRICE' },
          { id: 'od_total', label: 'TOTAL' },
          { id: 'od_price', label: 'PRICE' },
        ],
      },
    ],
  },
  {
    group: 'Est Beginning Stock',
    items: [
      {
        id: 'est_beg_stock', label: 'EST BEGINNING STOCK', type: 'group',
        children: [
          { id: 'ebs_corn', label: 'CORN' },
          { id: 'ebs_corn_map', label: 'CORN MAP' },
          { id: 'ebs_wheat', label: 'WHEAT' },
          { id: 'ebs_wheat_map', label: 'WHEAT MAP' },
          { id: 'ebs_total', label: 'TOTAL' },
          { id: 'ebs_map', label: 'MAP' },
          { id: 'ebs_doh', label: 'DOH' },
        ],
      },
    ],
  },
  {
    group: 'Grain Purchase Planning',
    items: [
      {
        id: 'grain_purchase', label: 'GRAIN PURCHASE PLANNING', type: 'group',
        children: [
          { id: 'gp_plan', label: 'PLAN' },
          { id: 'gp_real', label: 'REALIZATION' },
          { id: 'gp_balance', label: 'BALANCE' },
        ],
      },
    ],
  },
  {
    group: 'Today Purchase',
    items: [
      { id: 'today_purchase', label: 'TODAY PURCHASE', type: 'basic' },
    ],
  },
  {
    group: 'Est Ending Stock',
    items: [
      {
        id: 'est_end_stock', label: 'EST ENDING STOCK', type: 'group',
        children: [
          { id: 'ees_corn', label: 'CORN' },
          { id: 'ees_corn_map', label: 'CORN MAP' },
          { id: 'ees_wheat', label: 'WHEAT' },
          { id: 'ees_wheat_map', label: 'WHEAT MAP' },
          { id: 'ees_total', label: 'TOTAL' },
          { id: 'ees_map', label: 'MAP' },
          { id: 'ees_doh', label: 'DOH' },
          { id: 'ees_date', label: 'DATE' },
        ],
      },
    ],
  },
  {
    group: 'Market',
    items: [
      {
        id: 'market', label: 'MARKET', type: 'group',
        children: [
          { id: 'mkt_corn', label: 'CORN' },
          { id: 'mkt_wheat', label: 'WHEAT' },
        ],
      },
    ],
  },
  {
    group: 'Last Price',
    items: [
      {
        id: 'last_price', label: 'LAST PRICE', type: 'group',
        children: [
          { id: 'lp_corn', label: 'CORN' },
          { id: 'lp_wheat', label: 'WHEAT' },
        ],
      },
    ],
  },
  {
    group: 'Corn Avg 7d',
    items: [
      {
        id: 'corn_avg_7d', label: 'CORN AVG 7D', type: 'group',
        children: [
          { id: 'ca7_receive', label: 'RECEIVE' },
          { id: 'ca7_usage', label: 'USAGE' },
          { id: 'ca7_pct', label: '%' },
        ],
      },
    ],
  },
  {
    group: 'Wheat Avg 7d',
    items: [
      {
        id: 'wheat_avg_7d', label: 'WHEAT AVG 7D', type: 'group',
        children: [
          { id: 'wa7_receive', label: 'RECEIVE' },
          { id: 'wa7_usage', label: 'USAGE' },
        ],
      },
    ],
  },
  {
    group: 'Total Avg 7d',
    items: [
      {
        id: 'total_avg_7d', label: 'TOTAL AVG 7D', type: 'group',
        children: [
          { id: 'ta7_receive', label: 'RECEIVE' },
          { id: 'ta7_usage', label: 'USAGE' },
        ],
      },
    ],
  },
  {
    group: 'Usage Avg 14d',
    items: [
      {
        id: 'usage_avg_14d', label: 'USAGE AVG 14D', type: 'group',
        children: [
          { id: 'ua14_total', label: 'TOTAL' },
          { id: 'ua14_doh_end', label: 'DOH END' },
        ],
      },
    ],
  },
  // ── NEW: Date + Plant columns ──────────────────────────────────────────────
  {
    group: 'Date',
    items: [
      { id: 'report_date', label: 'DATE', type: 'basic' },
    ],
  },
  {
    group: 'Plant',
    items: [
      {
        id: 'plant_mdn', label: 'MDN', type: 'group',
        children: [
          { id: 'mdn_total_receive', label: 'TOTAL RECEIVE' },
          { id: 'mdn_usage',         label: 'USAGE' },
          { id: 'mdn_balance',       label: 'BALANCE' },
        ],
      },
      {
        id: 'plant_pdg', label: 'PDG', type: 'group',
        children: [
          { id: 'pdg_total_receive', label: 'TOTAL RECEIVE' },
          { id: 'pdg_usage',         label: 'USAGE' },
          { id: 'pdg_balance',       label: 'BALANCE' },
        ],
      },
      {
        id: 'plant_lpg', label: 'LPG', type: 'group',
        children: [
          { id: 'lpg_total_receive', label: 'TOTAL RECEIVE' },
          { id: 'lpg_usage',         label: 'USAGE' },
          { id: 'lpg_balance',       label: 'BALANCE' },
        ],
      },
      {
        id: 'plant_blr', label: 'BLR', type: 'group',
        children: [
          { id: 'blr_total_receive', label: 'TOTAL RECEIVE' },
          { id: 'blr_usage',         label: 'USAGE' },
          { id: 'blr_balance',       label: 'BALANCE' },
        ],
      },
      {
        id: 'plant_crb', label: 'CRB', type: 'group',
        children: [
          { id: 'crb_total_receive', label: 'TOTAL RECEIVE' },
          { id: 'crb_usage',         label: 'USAGE' },
          { id: 'crb_balance',       label: 'BALANCE' },
        ],
      },
      {
        id: 'plant_smg', label: 'SMG', type: 'group',
        children: [
          { id: 'smg_total_receive', label: 'TOTAL RECEIVE' },
          { id: 'smg_usage',         label: 'USAGE' },
          { id: 'smg_balance',       label: 'BALANCE' },
        ],
      },
    ],
  },
];
