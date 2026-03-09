const path = require('path');
const { validationResult } = require('express-validator');
const { pool } = require('../config/database');

const VALID_APPLICATION_STATUSES = new Set([
  'pending',
  'reviewed',
  'interview',
  'rejected',
  'hired',
]);

const sendValidationError = (req, res) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return false;
  }

  return res.status(400).json({
    success: false,
    message: errors.array({ onlyFirstError: true })[0].msg,
  });
};

const getJobOwnership = async (jobId) => {
  const result = await pool.query(
    `
      SELECT
        j.id,
        j.status,
        cp.id AS company_id,
        cp.user_id AS owner_user_id
      FROM jobs j
      INNER JOIN company_profiles cp ON cp.id = j.company_id
      WHERE j.id = $1
      LIMIT 1
    `,
    [jobId],
  );

  return result.rows[0] || null;
};

const getApplicationOwnership = async (applicationId) => {
  const result = await pool.query(
    `
      SELECT
        a.id,
        a.job_id,
        a.application_status,
        cp.user_id AS owner_user_id
      FROM applications a
      INNER JOIN jobs j ON j.id = a.job_id
      INNER JOIN company_profiles cp ON cp.id = j.company_id
      WHERE a.id = $1
      LIMIT 1
    `,
    [applicationId],
  );

  return result.rows[0] || null;
};

const applyToJob = async (req, res) => {
  if (sendValidationError(req, res)) {
    return;
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'A resume PDF is required.',
    });
  }

  try {
    const job = await getJobOwnership(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Applications are closed for this job.',
      });
    }

    const existingApplicationResult = await pool.query(
      `
        SELECT id
        FROM applications
        WHERE job_id = $1 AND applicant_id = $2
        LIMIT 1
      `,
      [req.params.id, req.user.id],
    );

    if (existingApplicationResult.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied to this job.',
      });
    }

    const resumeUrl = path.posix.join('/uploads', req.file.filename);
    const coverLetter = req.body.cover_letter?.trim() || null;

    const result = await pool.query(
      `
        INSERT INTO applications (
          job_id,
          applicant_id,
          resume_url,
          cover_letter
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          job_id,
          applicant_id,
          resume_url,
          cover_letter,
          application_status AS status,
          applied_at
      `,
      [req.params.id, req.user.id, resumeUrl, coverLetter],
    );

    return res.status(201).json({
      success: true,
      data: {
        application: result.rows[0],
      },
      message: 'Application submitted successfully.',
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'You have already applied to this job.',
      });
    }

    console.error('applyToJob error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to submit application at this time.',
    });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT
          a.id,
          a.job_id,
          a.resume_url,
          a.cover_letter,
          a.application_status AS status,
          a.applied_at,
          j.title AS job_title,
          j.location AS job_location,
          j.employment_type,
          cp.company_name,
          cp.logo_url
        FROM applications a
        INNER JOIN jobs j ON j.id = a.job_id
        INNER JOIN company_profiles cp ON cp.id = j.company_id
        WHERE a.applicant_id = $1
        ORDER BY a.applied_at DESC
      `,
      [req.user.id],
    );

    return res.status(200).json({
      success: true,
      data: {
        applications: result.rows,
      },
      message: 'Applications retrieved successfully.',
    });
  } catch (error) {
    console.error('getMyApplications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve applications at this time.',
    });
  }
};

const updateApplicationStatus = async (req, res) => {
  if (sendValidationError(req, res)) {
    return;
  }

  const status = req.body.status.trim().toLowerCase();

  if (!VALID_APPLICATION_STATUSES.has(status)) {
    return res.status(400).json({
      success: false,
      message: 'status is invalid.',
    });
  }

  try {
    const application = await getApplicationOwnership(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    if (application.owner_user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this application.',
      });
    }

    const result = await pool.query(
      `
        UPDATE applications
        SET application_status = $1::app_status
        WHERE id = $2
        RETURNING
          id,
          job_id,
          applicant_id,
          resume_url,
          cover_letter,
          application_status AS status,
          applied_at
      `,
      [status, req.params.id],
    );

    return res.status(200).json({
      success: true,
      data: {
        application: result.rows[0],
      },
      message: 'Application status updated successfully.',
    });
  } catch (error) {
    console.error('updateApplicationStatus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to update application status at this time.',
    });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  updateApplicationStatus,
};
