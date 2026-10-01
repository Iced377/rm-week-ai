// Synthetic Client A file used across the story. Fictional; for training only.
export const CLIENT_A = {
  asOf: '30 June 2026',
  total: 'SAR 45.2m',
  holdings: [
    { name: 'Murabaha deposits', value: 'SAR 14.0m', note: 'Mature 15 Nov 2026', page: 1 },
    { name: 'Sukuk fund (USD class)', value: 'USD 1.6m (≈ SAR 6.0m)', note: 'Holding matures 12 Mar 2028', page: 1 },
    { name: 'Saudi equities', value: 'SAR 17.4m', note: '62% in a single listed petrochemical company', page: 2 },
    { name: 'Saudi real estate fund', value: 'SAR 7.8m', note: 'Lock-up to Dec 2026; 90-day notice', page: 2 },
  ],
  fees: [
    { name: 'Management fee (discretionary portion)', value: '0.75% p.a.', page: 3 },
    { name: 'Custody fee', value: '0.10% p.a.', page: 3 },
    { name: 'Transaction charge', value: 'SAR 50 per trade', page: 3 },
    { name: 'Early redemption charge', value: '1% within 12 months', page: 3 },
  ],
  risk: 'Moderate, dated 14 Feb 2024',
  lastMeeting: '12 May 2026',
  notes: [
    'Eldest son now joins all meetings and leads investment questions.',
    'Son mentioned a property purchase needing about SAR 10m in Q1 2027.',
    'Principal raised succession planning; wants a family meeting before year end.',
    'Asked when zakat information for the holdings would be available (information only).',
  ],
};

export function statementHTML(opts = {}) {
  const A = CLIENT_A;
  const rows = A.holdings.map(x => `<tr><td>${x.name}</td><td>${x.value}</td><td>${x.note}</td><td>p.${x.page}</td></tr>`).join('');
  const fees = A.fees.map(x => `<tr><td>${x.name}</td><td>${x.value}</td><td></td><td>p.${x.page}</td></tr>`).join('');
  return `<div class="doc"><div class="dochead"><span>Client A · Portfolio statement · as of ${A.asOf}</span><span>Synthetic</span></div>
  <table><tr><th>Holding</th><th>Value</th><th>Detail</th><th>Page</th></tr>${rows}
  <tr><td><b>Total</b></td><td><b>${A.total}</b></td><td></td><td>p.1</td></tr>
  ${opts.fees ? `<tr><th colspan="4" style="padding-top:12px">Fees (mandate schedule)</th></tr>${fees}` : ''}
  </table>
  ${opts.notes ? `<p class="muted" style="margin:12px 0 4px"><b>Risk profile:</b> ${A.risk} (p.4) · <b>Last meeting note:</b> ${A.lastMeeting} (p.5)</p><ul class="muted" style="margin:0;padding-left:18px">${A.notes.map(n => `<li>${n}</li>`).join('')}</ul>` : ''}
  <span class="stamp">SYNTHETIC · TRAINING</span></div>`;
}
