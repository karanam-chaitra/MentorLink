/**
 * Pure business rules for profile validation and mentor capacity enforcement.
 * Separated for fast, deterministic unit testing (>= 80% coverage).
 */

function validateProfilePayload(profile, role) {
  const errors = [];
  if (!profile || typeof profile !== 'object') {
    return ['Profile payload is required'];
  }
  if (!profile.name || profile.name.trim().length < 2) {
    errors.push('Valid name is required');
  }
  if (!profile.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
    errors.push('Valid email is required');
  }
  if (role === 'student') {
    if (!Array.isArray(profile.interests) || profile.interests.length === 0) {
      errors.push('At least one interest is required');
    }
    if (!profile.goals || profile.goals.trim().length < 5) {
      errors.push('Mentee goals must be at least 5 characters');
    }
  } else if (role === 'mentor') {
    if (!Array.isArray(profile.expertise) || profile.expertise.length === 0) {
      errors.push('At least one area of expertise is required');
    }
    if (typeof profile.maxCapacity !== 'number' || profile.maxCapacity < 1) {
      errors.push('Mentor maxCapacity must be a positive integer');
    }
  }
  return errors;
}

/**
 * Enforces Phase 4 special test rule:
 * A mentor must NOT receive more requests than their set capacity.
 */
function canAcceptNewRequest(mentor) {
  if (!mentor || typeof mentor.maxCapacity !== 'number') {
    return { allowed: false, reason: 'Invalid mentor record' };
  }
  const active = mentor.activeRequestsCount || 0;
  if (active >= mentor.maxCapacity) {
    return {
      allowed: false,
      reason: `Mentor capacity reached (${active}/${mentor.maxCapacity})`
    };
  }
  return { allowed: true, remaining: mentor.maxCapacity - active };
}

/**
 * Masks sensitive personal fields before logging or sending to external AI tools.
 */
function sanitizeForLogs(profile) {
  if (!profile) return {};
  const { name, email, ...safeFields } = profile;
  return {
    ...safeFields,
    name: name ? `${name[0]}***` : undefined,
    email: email ? '***@masked' : undefined
  };
}

module.exports = {
  validateProfilePayload,
  canAcceptNewRequest,
  sanitizeForLogs
};
