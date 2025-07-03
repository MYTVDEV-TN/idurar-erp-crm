const mongoose = require('mongoose');
const crypto = require('crypto');
const Model = mongoose.model('ApiKey');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('ApiKey');

// Generate a secure API key and secret
const generateApiCredentials = (type = 'test') => {
  const key = `pk_${type}_${crypto.randomBytes(16).toString('hex')}`;
  const secret = crypto.randomBytes(32).toString('hex');
  return { key, secret };
};

// Override the create method to generate API credentials
methods.create = async (req, res) => {
  try {
    const { name, type = 'test', permissions = ['read'], expires = null } = req.body;

    // Generate API key and secret
    const { key, secret } = generateApiCredentials(type);

    // Create the new API key
    const result = await new Model({
      name,
      key,
      secret,
      type,
      permissions,
      expires: expires ? new Date(expires) : null,
      createdBy: req.admin._id,
    }).save();

    // Return the result with the secret (this is the only time the secret will be visible)
    return res.status(200).json({
      success: true,
      result: {
        ...result.toObject(),
        secret, // Include the plain secret in the response
      },
      message: 'API key created successfully',
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

// Override the read method to never return the secret
methods.read = async (req, res) => {
  try {
    const result = await Model.findOne({
      _id: req.params.id,
      removed: false,
    }).exec();

    if (!result) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'API key not found',
      });
    }

    // Remove the secret from the result
    const apiKey = result.toObject();
    apiKey.secret = undefined;

    return res.status(200).json({
      success: true,
      result: apiKey,
      message: 'API key retrieved successfully',
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

// Override the list method to never return secrets
methods.list = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = parseInt(req.query.items) || 10;
    const skip = page * limit - limit;

    // Get the results but exclude the secret field
    const resultsPromise = Model.find({ removed: false })
      .select('-secret')
      .skip(skip)
      .limit(limit)
      .sort({ created: -1 })
      .exec();

    const countPromise = Model.countDocuments({ removed: false });

    const [result, count] = await Promise.all([resultsPromise, countPromise]);

    const pages = Math.ceil(count / limit);

    const pagination = { page, pages, count };

    if (count > 0) {
      return res.status(200).json({
        success: true,
        result,
        pagination,
        message: 'API keys retrieved successfully',
      });
    } else {
      return res.status(203).json({
        success: true,
        result: [],
        pagination,
        message: 'No API keys found',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
    });
  }
};

// Add a method to regenerate an API key
methods.regenerate = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the API key
    const apiKey = await Model.findOne({ _id: id, removed: false });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'API key not found',
      });
    }

    // Generate new credentials
    const { key, secret } = generateApiCredentials(apiKey.type);

    // Update the API key
    const result = await Model.findOneAndUpdate(
      { _id: id },
      { key, secret, updated: new Date() },
      { new: true }
    ).exec();

    return res.status(200).json({
      success: true,
      result: {
        ...result.toObject(),
        secret, // Include the plain secret in the response
      },
      message: 'API key regenerated successfully',
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

// Add a method to revoke an API key
methods.revoke = async (req, res) => {
  try {
    const { id } = req.params;

    // Update the API key status to revoked
    const result = await Model.findOneAndUpdate(
      { _id: id, removed: false },
      { status: 'revoked', updated: new Date() },
      { new: true }
    ).exec();

    if (!result) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'API key not found',
      });
    }

    return res.status(200).json({
      success: true,
      result,
      message: 'API key revoked successfully',
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