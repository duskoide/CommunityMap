const express = require("express");
const { requireRole } = require("../../middlewares/auth");
const {
  getAdminStats,
  listReports,
  updateReportStatus,
} = require("../reports/reports.service");

const router = express.Router();

router.use(requireRole("admin"));

router.get("/reports", async (req, res, next) => {
  try {
    const reports = await listReports({
      viewerId: req.user.id,
      category: req.query.category,
      status: req.query.status,
      district: req.query.district,
      search: req.query.search,
      dateRange: req.query.dateRange,
      sort: req.query.sort,
    });

    res.json({
      data: reports,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/reports/:id/verify", async (req, res, next) => {
  try {
    const report = await updateReportStatus(
      req.params.id,
      "verified",
      req.user.id,
      req.body?.note || "Lokasi dan laporan diverifikasi oleh petugas.",
    );

    res.json({
      data: report,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/reports/:id/status", async (req, res, next) => {
  try {
    const report = await updateReportStatus(
      req.params.id,
      req.body?.nextStatus,
      req.user.id,
      req.body?.note,
    );

    res.json({
      data: report,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/stats", async (_req, res, next) => {
  try {
    const stats = await getAdminStats();
    res.json({
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = { adminRouter: router };
