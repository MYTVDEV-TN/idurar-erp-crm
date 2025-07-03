const express = require('express');
const { catchErrors } = require('@/handlers/errorHandlers');
const router = express.Router();

const appControllers = require('@/controllers/appControllers');
const { routesList } = require('@/models/utils');

const stripeController = require('@/controllers/appControllers/stripeController');
const branchController = require('@/controllers/appControllers/branchController');
const apiKeyController = require('@/controllers/appControllers/apiKeyController');
const roleController = require('@/controllers/appControllers/roleController');

const routerApp = (entity, controller) => {
  router.route(`/${entity}/create`).post(catchErrors(controller['create']));
  router.route(`/${entity}/read/:id`).get(catchErrors(controller['read']));
  router.route(`/${entity}/update/:id`).patch(catchErrors(controller['update']));
  router.route(`/${entity}/delete/:id`).delete(catchErrors(controller['delete']));
  router.route(`/${entity}/search`).get(catchErrors(controller['search']));
  router.route(`/${entity}/list`).get(catchErrors(controller['list']));
  router.route(`/${entity}/listAll`).get(catchErrors(controller['listAll']));
  router.route(`/${entity}/filter`).get(catchErrors(controller['filter']));
  router.route(`/${entity}/summary`).get(catchErrors(controller['summary']));

  if (entity === 'invoice' || entity === 'quote' || entity === 'payment') {
    router.route(`/${entity}/mail`).post(catchErrors(controller['mail']));
  }

  if (entity === 'quote') {
    router.route(`/${entity}/convert/:id`).get(catchErrors(controller['convert']));
  }
};

routesList.forEach(({ entity, controllerName }) => {
  const controller = appControllers[controllerName];
  routerApp(entity, controller);
});

// Stripe payment routes
router.route('/stripe/create-payment-intent').post(catchErrors(stripeController.createPaymentIntent));
router.route('/stripe/webhook').post(catchErrors(stripeController.handleWebhook));
router.route('/stripe/payment-methods/:clientId').get(catchErrors(stripeController.getPaymentMethods));

// Branch management routes
router.route('/branch/create').post(catchErrors(branchController.create));
router.route('/branch/read/:id').get(catchErrors(branchController.read));
router.route('/branch/update/:id').patch(catchErrors(branchController.update));
router.route('/branch/delete/:id').delete(catchErrors(branchController.delete));
router.route('/branch/list').get(catchErrors(branchController.list));
router.route('/branch/default').get(catchErrors(branchController.getDefaultBranch));

// API key management routes
router.route('/apiKey/create').post(catchErrors(apiKeyController.create));
router.route('/apiKey/read/:id').get(catchErrors(apiKeyController.read));
router.route('/apiKey/list').get(catchErrors(apiKeyController.list));
router.route('/apiKey/regenerate/:id').post(catchErrors(apiKeyController.regenerate));
router.route('/apiKey/revoke/:id').post(catchErrors(apiKeyController.revoke));

// Role management routes
router.route('/role/create').post(catchErrors(roleController.create));
router.route('/role/read/:id').get(catchErrors(roleController.read));
router.route('/role/update/:id').patch(catchErrors(roleController.update));
router.route('/role/delete/:id').delete(catchErrors(roleController.delete));
router.route('/role/list').get(catchErrors(roleController.list));
router.route('/role/assign').post(catchErrors(roleController.assignRole));
router.route('/role/permissions').get(catchErrors(roleController.getPermissions));

module.exports = router;