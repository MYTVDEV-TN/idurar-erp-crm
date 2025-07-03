const mongoose = require('mongoose');
const ApiKey = mongoose.model('ApiKey');

const apiKeyAuth = async (req, res, next) => {
  try {
    // Get API key from header
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'API key is required',
      });
    }
    
    // Find the API key in the database
    const apiKeyDoc = await ApiKey.findOne({ 
      key: apiKey, 
      status: 'active',
      removed: false
    });
    
    if (!apiKeyDoc) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'Invalid or inactive API key',
      });
    }
    
    // Check if the API key has expired
    if (apiKeyDoc.expires && new Date(apiKeyDoc.expires) < new Date()) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'API key has expired',
      });
    }
    
    // Check if the API key has the required permissions for this request
    const method = req.method.toLowerCase();
    const requiredPermission = (method === 'get') ? 'read' : 'write';
    
    if (!apiKeyDoc.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        result: null,
        message: `API key does not have ${requiredPermission} permission`,
      });
    }
    
    // Update last used timestamp
    await ApiKey.findOneAndUpdate(
      { _id: apiKeyDoc._id },
      { lastUsed: new Date() }
    );
    
    // Attach API key info to request for later use
    req.apiKey = {
      id: apiKeyDoc._id,
      name: apiKeyDoc.name,
      permissions: apiKeyDoc.permissions,
      type: apiKeyDoc.type,
    };
    
    // Continue to the next middleware or route handler
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

module.exports = apiKeyAuth;