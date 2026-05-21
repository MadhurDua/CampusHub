/**
 * Role Hierarchy & Permissions System
 * 
 * Hierarchy (top to bottom):
 * 1. main_admin - Ultimate authority, can promote to college_admin
 * 2. college_admin - Controls everything in their college, can promote to college_management
 * 3. college_management - Can add opportunities, can promote to faculty
 * 4. faculty - Standard faculty permissions
 * 5. student - Standard student permissions
 */

// Role hierarchy levels (higher number = more authority)
export const ROLE_LEVELS = {
  student: 1,
  faculty: 2,
  college_management: 3,
  college_admin: 4,
  main_admin: 5
};

// Role promotion rules: who can promote to which roles
export const PROMOTION_RULES = {
  main_admin: ['college_admin', 'college_management', 'faculty', 'student'],
  college_admin: ['college_management', 'faculty', 'student'],
  college_management: ['faculty', 'student'],
  faculty: [],
  student: []
};

/**
 * Check if a user has sufficient role level
 */
export function hasRoleLevel(userRole, requiredRole) {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole];
}

/**
 * Check if a user can promote someone to a target role
 */
export function canPromoteToRole(promoterRole, targetRole) {
  return PROMOTION_RULES[promoterRole]?.includes(targetRole) || false;
}

/**
 * Check if user belongs to the same college (for college-specific admins)
 */
export function isSameCollege(user1CollegeId, user2CollegeId) {
  return user1CollegeId && user2CollegeId && user1CollegeId === user2CollegeId;
}

/**
 * Middleware: Require specific role
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ detail: 'Not authenticated' });
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    res.status(403).json({ 
      detail: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
    });
  };
}

/**
 * Middleware: Require minimum role level
 */
export function requireRoleLevel(minimumRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ detail: 'Not authenticated' });
    }

    if (hasRoleLevel(req.user.role, minimumRole)) {
      return next();
    }

    res.status(403).json({ 
      detail: `Access denied. Minimum role required: ${minimumRole}` 
    });
  };
}

/**
 * Middleware: Require same college (for college admins)
 */
export function requireSameCollege(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ detail: 'Not authenticated' });
  }

  // Main admin can access all colleges
  if (req.user.role === 'main_admin') {
    return next();
  }

  // For college-specific roles, check college_id
  const targetCollegeId = req.params.collegeId || req.body.college_id || req.user.college_id;
  
  if (!isSameCollege(req.user.college_id, targetCollegeId)) {
    return res.status(403).json({ 
      detail: 'Access denied. You can only manage users from your college.' 
    });
  }

  next();
}

/**
 * Get permissions for a role
 */
export function getRolePermissions(role) {
  const permissions = {
    student: [
      'view_events',
      'register_events',
      'join_clubs',
      'view_opportunities',
      'share_resources',
      'use_marketplace',
      'use_lost_found'
    ],
    faculty: [
      'view_events',
      'register_events',
      'join_clubs',
      'approve_clubs',
      'view_opportunities',
      'share_resources',
      'use_marketplace',
      'use_lost_found'
    ],
    college_management: [
      'view_events',
      'register_events',
      'join_clubs',
      'approve_clubs',
      'create_opportunities',  // New permission
      'view_opportunities',
      'share_resources',
      'use_marketplace',
      'use_lost_found',
      'promote_to_faculty'  // New permission
    ],
    college_admin: [
      'full_college_control',  // Can do everything within their college
      'promote_to_college_management',
      'promote_to_faculty',
      'manage_college_clubs',
      'manage_college_events',
      'manage_college_opportunities',
      'manage_college_users'
    ],
    main_admin: [
      'full_system_control',  // Ultimate authority
      'promote_to_college_admin',
      'promote_to_college_management',
      'promote_to_faculty',
      'manage_all_colleges',
      'view_system_stats'
    ]
  };

  return permissions[role] || permissions.student;
}
