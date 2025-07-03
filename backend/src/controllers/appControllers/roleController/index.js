const mongoose = require('mongoose');
const Model = mongoose.model('Role');
const AdminModel = mongoose.model('Admin');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('Role');

// Override the create method
methods.create = async (req, res) => {
  try {
    const { name, description, permissions, status = 'active' } = req.body;

    // Check if a role with the same name already exists
    const existingRole = await Model.findOne({ name, removed: false });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'A role with this name already exists',
      });
    }

    // Create the new role
    const result = await new Model({
      name,
      description,
      permissions,
      status,
      createdBy: req.admin._id,
    }).save();

    return res.status(200).json({
      success: true,
      result,
      message: 'Role created successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
    });
  }
};

// Override the update method
methods.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions, status } = req.body;

    // Check if a different role with the same name already exists
    const existingRole = await Model.findOne({ 
      name, 
      _id: { $ne: id },
      removed: false 
    });
    
    if (existingRole) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'A role with this name already exists',
      });
    }

    // Update the role
    const result = await Model.findOneAndUpdate(
      { _id: id, removed: false },
      {
        name,
        description,
        permissions,
        status,
        updated: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).exec();

    if (!result) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Role not found',
      });
    }

    return res.status(200).json({
      success: true,
      result,
      message: 'Role updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
    });
  }
};

// Override the delete method to check if the role is in use
methods.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any admin is using this role
    const adminUsingRole = await AdminModel.findOne({ role: id, removed: false });
    
    if (adminUsingRole) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'This role is assigned to one or more users and cannot be deleted',
      });
    }

    // Delete the role (soft delete)
    const result = await Model.findOneAndUpdate(
      { _id: id },
      { removed: true },
      { new: true }
    ).exec();

    if (!result) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Role not found',
      });
    }

    return res.status(200).json({
      success: true,
      result,
      message: 'Role deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
    });
  }
};

// Add a method to assign a role to a user
methods.assignRole = async (req, res) => {
  try {
    const { roleId, userId } = req.body;

    // Check if the role exists
    const role = await Model.findOne({ _id: roleId, removed: false });
    if (!role) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Role not found',
      });
    }

    // Check if the user exists
    const user = await AdminModel.findOne({ _id: userId, removed: false });
    if (!user) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'User not found',
      });
    }

    // Update the user's role
    const result = await AdminModel.findOneAndUpdate(
      { _id: userId },
      { role: roleId },
      { new: true }
    ).exec();

    return res.status(200).json({
      success: true,
      result,
      message: 'Role assigned successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
    });
  }
};

// Add a method to get all available permissions
methods.getPermissions = async (req, res) => {
  try {
    // This would typically come from a database, but for simplicity we'll define it here
    const permissions = [
      { id: 'dashboard_view', name: 'View Dashboard', module: 'dashboard' },
      { id: 'invoice_create', name: 'Create Invoice', module: 'invoice' },
      { id: 'invoice_view', name: 'View Invoice', module: 'invoice' },
      { id: 'invoice_edit', name: 'Edit Invoice', module: 'invoice' },
      { id: 'invoice_delete', name: 'Delete Invoice', module: 'invoice' },
      { id: 'quote_create', name: 'Create Quote', module: 'quote' },
      { id: 'quote_view', name: 'View Quote', module: 'quote' },
      { id: 'quote_edit', name: 'Edit Quote', module: 'quote' },
      { id: 'quote_delete', name: 'Delete Quote', module: 'quote' },
      { id: 'payment_create', name: 'Create Payment', module: 'payment' },
      { id: 'payment_view', name: 'View Payment', module: 'payment' },
      { id: 'payment_edit', name: 'Edit Payment', module: 'payment' },
      { id: 'payment_delete', name: 'Delete Payment', module: 'payment' },
      { id: 'client_create', name: 'Create Client', module: 'client' },
      { id: 'client_view', name: 'View Client', module: 'client' },
      { id: 'client_edit', name: 'Edit Client', module: 'client' },
      { id: 'client_delete', name: 'Delete Client', module: 'client' },
      { id: 'settings_view', name: 'View Settings', module: 'settings' },
      { id: 'settings_edit', name: 'Edit Settings', module: 'settings' },
      { id: 'admin_create', name: 'Create Admin', module: 'admin' },
      { id: 'admin_view', name: 'View Admin', module: 'admin' },
      { id: 'admin_edit', name: 'Edit Admin', module: 'admin' },
      { id: 'admin_delete', name: 'Delete Admin', module: 'admin' },
    ];

    return res.status(200).json({
      success: true,
      result: permissions,
      message: 'Permissions retrieved successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
    });
  }
};

module.exports = methods;