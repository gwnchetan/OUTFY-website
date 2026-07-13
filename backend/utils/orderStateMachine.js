/**
 * Order Status State Machine
 * Defines valid transitions between order statuses.
 * Isolated for testability and reuse across controllers.
 */

const validTransitions = {
  pending:          ['processing', 'cancelled'],
  processing:       ['shipped', 'cancelled'],
  shipped:          ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered'],
  delivered:        [],
  cancelled:        [],
};

const STATUS_LABELS = {
  pending:          'Pending',
  processing:       'Processing',
  shipped:          'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
};

/**
 * Check if a transition from one status to another is valid.
 * @param {string} from - Current status
 * @param {string} to   - Target status
 * @returns {boolean}
 */
function canTransition(from, to) {
  return validTransitions[from]?.includes(to) ?? false;
}

/**
 * Get list of valid next states for a given status.
 * @param {string} currentStatus
 * @returns {string[]}
 */
function getNextStates(currentStatus) {
  return validTransitions[currentStatus] || [];
}

module.exports = { canTransition, getNextStates, validTransitions, STATUS_LABELS };
