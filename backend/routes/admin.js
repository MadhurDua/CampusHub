import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  requireRole, 
  requireRoleLevel, 
  requireSameCollege,
  canPromoteToRole,
  getRolePermissions 
} from '../middleware/roleHierarchy.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/users', authenticateToken, requireRoleLevel('college_management'), async (req, res) => {
  try {
    const { role: userRole, college_id: userCollegeId } = req.user;
    
    let query = {};
    
    if (userRole === 'college_admin' || userRole === 'college_management') {
      if (!userCollegeId) {
        return res.status(400).json({ detail: 'Your account is missing college information' });
      }
      query.college_id = userCollegeId;
    }

    const users = await User.find(query).select('-hashed_password');
    
    const manageableUsers = users.filter(user => {
      if (userRole === 'main_admin') {
        return true;
      }
      
      if (userRole === 'college_admin' || userRole === 'college_management') {
        if (!user.college_id || !userCollegeId) {
          return false;
        }
        if (user.college_id.toLowerCase() !== userCollegeId.toLowerCase()) {
          return false;
        }
      }
      
      if (userRole === 'college_admin') {
        return ['college_management', 'faculty', 'student'].includes(user.role);
      }
      
      if (userRole === 'college_management') {
        return ['faculty', 'student'].includes(user.role);
      }
      
      return false;
    });
    
    res.json(manageableUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ detail: 'Failed to fetch users' });
  }
});

router.post('/users/:userId/promote', authenticateToken, requireRoleLevel('college_management'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { target_role } = req.body;
    const promoter = req.user;

    const targetUser = await User.findOne({ id: userId });
    if (!targetUser) {
      return res.status(404).json({ detail: 'User not found' });
    }

    if (targetUser.role === 'main_admin') {
      return res.status(403).json({ 
        detail: 'The main admin cannot be demoted or modified. This account has ultimate protection.' 
      });
    }

    if (target_role === 'main_admin') {
      return res.status(403).json({ 
        detail: 'Cannot promote users to main_admin role. This is a protected system role.' 
      });
    }

    if (targetUser.id === promoter.id) {
      return res.status(400).json({ 
        detail: 'You cannot promote yourself' 
      });
    }

    const ROLE_LEVELS = {
      student: 1,
      faculty: 2,
      college_management: 3,
      college_admin: 4,
      main_admin: 5
    };
    
    if (ROLE_LEVELS[targetUser.role] >= ROLE_LEVELS[promoter.role]) {
      return res.status(403).json({ 
        detail: 'You cannot promote users at your level or higher' 
      });
    }

    if (!canPromoteToRole(promoter.role, target_role)) {
      return res.status(403).json({ 
        detail: `You don't have permission to promote users to ${target_role}` 
      });
    }

    if (promoter.role !== 'main_admin') {
      if (targetUser.college_id !== promoter.college_id) {
        return res.status(403).json({ 
          detail: 'You can only promote users from your college' 
        });
      }
    }

    targetUser.role = target_role;
    await targetUser.save();

    res.json({ 
      message: `User ${targetUser.full_name} promoted to ${target_role}`,
      user: targetUser
    });

  } catch (error) {
    console.error('Error promoting user:', error);
    res.status(500).json({ detail: 'Failed to promote user' });
  }
});

router.post('/users/:userId/demote', authenticateToken, requireRoleLevel('college_admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { target_role } = req.body;
    const admin = req.user;

    const targetUser = await User.findOne({ id: userId });
    if (!targetUser) {
      return res.status(404).json({ detail: 'User not found' });
    }

    if (targetUser.role === 'main_admin') {
      return res.status(403).json({ 
        detail: 'The main admin cannot be demoted. This account has ultimate protection.' 
      });
    }

    if (targetUser.id === admin.id) {
      return res.status(400).json({ detail: 'You cannot demote yourself' });
    }

    const ROLE_LEVELS = {
      student: 1,
      faculty: 2,
      college_management: 3,
      college_admin: 4,
      main_admin: 5
    };
    
    if (ROLE_LEVELS[targetUser.role] >= ROLE_LEVELS[admin.role]) {
      return res.status(403).json({ 
        detail: 'You cannot demote users at your level or higher' 
      });
    }

    if (admin.role !== 'main_admin') {
      if (targetUser.college_id !== admin.college_id) {
        return res.status(403).json({ 
          detail: 'You can only demote users from your college' 
        });
      }
    }

    targetUser.role = target_role;
    await targetUser.save();

    res.json({ 
      message: `User ${targetUser.full_name} demoted to ${target_role}`,
      user: targetUser
    });

  } catch (error) {
    console.error('Error demoting user:', error);
    res.status(500).json({ detail: 'Failed to demote user' });
  }
});

router.get('/stats/college', authenticateToken, requireRoleLevel('college_management'), async (req, res) => {
  try {
    const { role: userRole, college_id: userCollegeId } = req.user;
    
    let collegeFilter = {};
    if (userRole !== 'main_admin') {
      collegeFilter.college_id = userCollegeId;
    }

    let manageableRoles = [];
    if (userRole === 'main_admin') {
      manageableRoles = ['student', 'faculty', 'college_management', 'college_admin', 'main_admin'];
    } else if (userRole === 'college_admin') {
      manageableRoles = ['student', 'faculty', 'college_management'];
    } else if (userRole === 'college_management') {
      manageableRoles = ['student', 'faculty'];
    }

    const stats = {
      total_users: await User.countDocuments({ ...collegeFilter, role: { $in: manageableRoles } }),
      students: await User.countDocuments({ ...collegeFilter, role: 'student' }),
      faculty: await User.countDocuments({ ...collegeFilter, role: 'faculty' }),
      college_management: manageableRoles.includes('college_management') 
        ? await User.countDocuments({ ...collegeFilter, role: 'college_management' })
        : 0,
      college_admins: manageableRoles.includes('college_admin')
        ? await User.countDocuments({ ...collegeFilter, role: 'college_admin' })
        : 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ detail: 'Failed to fetch statistics' });
  }
});

router.get('/my-permissions', authenticateToken, (req, res) => {
  try {
    const permissions = getRolePermissions(req.user.role);
    res.json({
      role: req.user.role,
      college_id: req.user.college_id,
      permissions
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ detail: 'Failed to fetch permissions' });
  }
});

router.delete('/users/:userId', authenticateToken, requireRoleLevel('college_admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const admin = req.user;

    const targetUser = await User.findOne({ id: userId });
    if (!targetUser) {
      return res.status(404).json({ detail: 'User not found' });
    }

    if (targetUser.role === 'main_admin') {
      return res.status(403).json({ 
        detail: 'The main admin account cannot be deleted. This account has ultimate protection.' 
      });
    }

    if (targetUser.id === admin.id) {
      return res.status(400).json({ 
        detail: 'You cannot delete your own account' 
      });
    }

    const ROLE_LEVELS = {
      student: 1,
      faculty: 2,
      college_management: 3,
      college_admin: 4,
      main_admin: 5
    };
    
    if (ROLE_LEVELS[targetUser.role] >= ROLE_LEVELS[admin.role]) {
      return res.status(403).json({ 
        detail: 'You cannot delete users at your level or higher' 
      });
    }

    if (admin.role === 'college_admin') {
      if (!targetUser.college_id || !admin.college_id) {
        return res.status(400).json({ 
          detail: 'College information missing' 
        });
      }
      if (targetUser.college_id.toLowerCase() !== admin.college_id.toLowerCase()) {
        return res.status(403).json({ 
          detail: 'You can only delete users from your college' 
        });
      }
    }

    await User.findOneAndDelete({ id: userId });

    res.json({ 
      message: `User ${targetUser.full_name} (${targetUser.email}) has been deleted successfully` 
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ detail: 'Failed to delete user' });
  }
});

export default router;
