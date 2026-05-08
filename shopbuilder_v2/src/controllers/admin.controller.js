const adminService = require("../services/admin.service");
const { success, paginated } = require("../utils/response");

async function dashboard(req, res, next) {
  try {
    const data = await adminService.getDashboard();
    return success(res, data);
  } catch (err) { next(err); }
}

async function listTenants(req, res, next) {
  try {
    const { cursor, limit } = req.query;
    const result = await adminService.listAllTenants({ cursor, limit: limit ? parseInt(limit) : 20 });
    return paginated(res, result.items, result.nextCursor, result.items.length);
  } catch (err) { next(err); }
}

async function suspendTenant(req, res, next) {
  try {
    const result = await adminService.suspendTenant(req.params.tenantId, req.body.reason);
    return success(res, result);
  } catch (err) { next(err); }
}

async function activateTenant(req, res, next) {
  try {
    const result = await adminService.activateTenant(req.params.tenantId);
    return success(res, result);
  } catch (err) { next(err); }
}

async function listUsers(req, res, next) {
  try {
    const { cursor, limit } = req.query;
    const result = await adminService.listAllUsers({ cursor, limit: limit ? parseInt(limit) : 20 });
    return paginated(res, result.items, result.nextCursor, result.items.length);
  } catch (err) { next(err); }
}

async function deactivateUser(req, res, next) {
  try {
    const result = await adminService.deactivateUser(req.params.userId);
    return success(res, result);
  } catch (err) { next(err); }
}

module.exports = { dashboard, listTenants, suspendTenant, activateTenant, listUsers, deactivateUser };
