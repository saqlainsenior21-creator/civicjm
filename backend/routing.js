// Parish-based issue auto-routing
// Determines which government agency should handle an issue based on category + parish

// NWA handles all road infrastructure and flooding nationwide
const NWA_CATEGORIES = ['broken_road', 'flooding'];

// KSAC covers Kingston and St. Andrew for all non-NWA categories
const KSAC_PARISHES = ['Kingston', 'St. Andrew'];
const KSAC = 'Kingston & St. Andrew Municipal Corporation';
const NWA  = 'National Works Agency';

// All 14 Jamaican parish councils
const PARISH_COUNCILS = {
  'St. Thomas':   'St. Thomas Parish Council',
  'Portland':     'Portland Parish Council',
  'St. Mary':     'St. Mary Parish Council',
  'St. Ann':      'St. Ann Parish Council',
  'Trelawny':     'Trelawny Parish Council',
  'St. James':    'St. James Parish Council',
  'Hanover':      'Hanover Parish Council',
  'Westmoreland': 'Westmoreland Parish Council',
  'St. Elizabeth':'St. Elizabeth Parish Council',
  'Manchester':   'Manchester Parish Council',
  'Clarendon':    'Clarendon Parish Council',
  'St. Catherine':'St. Catherine Parish Council',
};

/**
 * Returns the correct agency name for a given category + parish.
 * Returns null only if parish is unrecognised (should not happen in practice).
 */
function autoRoute(category, parish) {
  // NWA owns roads and flooding infrastructure across all parishes
  if (NWA_CATEGORIES.includes(category)) return NWA;

  // KSAC handles municipal services in Kingston & St. Andrew
  if (KSAC_PARISHES.includes(parish)) return KSAC;

  // Remaining parishes → their Parish Council
  return PARISH_COUNCILS[parish] || null;
}

module.exports = { autoRoute, NWA, KSAC, PARISH_COUNCILS, NWA_CATEGORIES, KSAC_PARISHES };
