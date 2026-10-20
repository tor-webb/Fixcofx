const NF = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function fmtPrice(value, precision = 5) {
  if (value == null || Number.isNaN(value)) return '—';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}

export function fmtPct(value) {
  if (value == null || Number.isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${NF.format(value)}%`;
}

export function fmtSize(value, precision = 2) {
  if (value == null || Number.isNaN(value)) return '—';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}

export function dirClass(change) {
  if (change == null || change === 0) return '';
  return change > 0 ? 'up' : 'down';
}
