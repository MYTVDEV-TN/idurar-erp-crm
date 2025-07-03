const mongoose = require('mongoose');
const AdminModel = mongoose.model('Admin');
const RoleModel = mongoose.model('Role');

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // If using API key authentication, check permissions there
      if (req.apiKey) {
        // For API keys, we've already checked basic read/write permissions
        // For more granular permissions, we could implement additional checks here
        return next();
      }
      
      // Otherwise, check user permissions
      const adminId = req.admin._id;
      
      // Get the admin with their role
      const admin = await AdminModel.findById(adminId).exec();
      
      if (!admin) {
        return res.status(401).json({
          success: false,
          result: null,
          message: 'User not found',
        });
      }
      
      // If the user is an owner, they have all permissions
      if (admin.role === 'owner') {
        return next();
      }
      
      // Get the role and its permissions
      const role = await RoleModel.findOne({ _id: admin.role, removed: false }).exec();
      
      if (!role) {
        return res.status(403).json({
          success: false,
          result: null,
          message: 'User role not found',
        });
      }
      
      // Check if the role has the required permission
      if (!role.permissions.includes(requiredPermission)) {
        return res.status(403).json({
          success: false,
          result: null,
          message: 'You do not have permission to perform this action',
        });
      }
      
      // User has the required permission, proceed
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        result: null,
        message: error.message,
        error: error,
      });
    }
  };
};

module.exports = checkPermission;