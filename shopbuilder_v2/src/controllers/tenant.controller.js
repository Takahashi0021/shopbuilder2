const tenantService = require("../services/tenant.service");
const { success, error } = require("../utils/response");

async function onboard(req, res, next) {
  try {
    const tenant = await tenantService.onboardTenant({
      ...req.body,
      ownerId: req.user.userId,
    });
    return success(res, { tenant }, 201);
  } catch (err) {
    next(err);
  }
}

async function getMyTenant(req, res, next) {
  try {
    if (!req.user.tenantId) {
      return error(res, "No tenant associated with this account", 404);
    }
    const tenant = await tenantService.getTenant(req.user.tenantId);
    return success(res, { tenant });
  } catch (err) {
    next(err);
  }
}

async function createWebhook(req, res, next) {
  try {
    if (!req.user.tenantId) {
      return error(res, "No tenant associated with this account", 403);
    }
    const webhook = await tenantService.createWebhook({
      tenantId: req.user.tenantId,
      ...req.body,
    });
    return success(res, { webhook }, 201);
  } catch (err) {
    next(err);
  }
}

async function listWebhooks(req, res, next) {
  try {
    if (!req.user.tenantId) {
      return error(res, "No tenant associated with this account", 403);
    }
    const webhooks = await tenantService.listWebhooks(req.user.tenantId);
    return success(res, { webhooks });
  } catch (err) {
    next(err);
  }
}

module.exports = { onboard, getMyTenant, createWebhook, listWebhooks };
