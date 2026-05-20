const express = require("express");
const { requireAuth } = require("../../middlewares/auth");
const {
  addUpvote,
  createReport,
  getReportByReferenceCode,
  listReports,
  removeUpvote,
} = require("./reports.service");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const reports = await listReports({
      viewerId: req.user?.id || null,
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

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const reports = await listReports({
      viewerId: req.user.id,
      reporterId: req.user.id,
      sort: "latest",
    });

    res.json({
      data: reports,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const report = await getReportByReferenceCode(req.params.id, req.user?.id || null);

    if (!report) {
      res.status(404).json({
        error: {
          message: "Laporan tidak ditemukan.",
        },
      });
      return;
    }

    res.json({
      data: report,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const report = await createReport(req.body || {}, req.user.id);
    res.status(201).json({
      data: report,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/upvote", requireAuth, async (req, res, next) => {
  try {
    const report = await addUpvote(req.params.id, req.user.id);
    res.json({
      data: report,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id/upvote", requireAuth, async (req, res, next) => {
  try {
    const report = await removeUpvote(req.params.id, req.user.id);
    res.json({
      data: report,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = { reportsRouter: router };
