const mongoose = require('mongoose');
const Model = mongoose.model('Branch');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('Branch');

// Override the create method to handle default branch logic
methods.create = async (req, res) => {
  try {
    const { isDefault } = req.body;

    // If this branch is set as default, update all other branches to not be default
    if (isDefault) {
      await Model.updateMany({}, { isDefault: false });
    }

    // Check if there are any branches
    const count = await Model.countDocuments({ removed: false });
    
    // If no branches exist, make this one default regardless of input
    const shouldBeDefault = count === 0 ? true : isDefault;

    // Create the new branch
    const result = await new Model({
      ...req.body,
      isDefault: shouldBeDefault,
      createdBy: req.admin._id,
    }).save();

    return res.status(200).json({
      success: true,
      result,
      message: 'Branch created successfully',
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

// Override the update method to handle default branch logic
methods.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { isDefault } = req.body;

    // If this branch is being set as default, update all other branches
    if (isDefault) {
      await Model.updateMany({ _id: { $ne: id } }, { isDefault: false });
    }

    // Update the branch
    const result = await Model.findOneAndUpdate(
      { _id: id, removed: false },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).exec();

    if (!result) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Branch not found',
      });
    }

    // If there's only one branch, ensure it's set as default
    const count = await Model.countDocuments({ removed: false });
    if (count === 1 && !result.isDefault) {
      await Model.findOneAndUpdate(
        { _id: id },
        { isDefault: true },
        { new: true }
      ).exec();
    }

    return res.status(200).json({
      success: true,
      result,
      message: 'Branch updated successfully',
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

// Override the delete method to prevent deleting the default branch
methods.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if this is the default branch
    const branch = await Model.findOne({ _id: id, removed: false });
    
    if (!branch) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Branch not found',
      });
    }

    if (branch.isDefault) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Cannot delete the default branch',
      });
    }

    // Delete the branch (soft delete)
    const result = await Model.findOneAndUpdate(
      { _id: id },
      { removed: true },
      { new: true }
    ).exec();

    return res.status(200).json({
      success: true,
      result,
      message: 'Branch deleted successfully',
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