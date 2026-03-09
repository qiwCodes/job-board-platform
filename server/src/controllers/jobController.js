const { validationResult } = require('express-validator');
const { pool } = require('../config/database');

const ALLOWED_EMPLOYMENT_TYPES = new Set([
  'full-time',
  'part-time',
  'contract',
  'internship',
  'remote',
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

const parseOptionalNonNegativeInteger = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return { value: null };
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return { error: `${fieldName} must be a non-negative integer.` };
  }

  return { value: parsed };
};

const parsePaginationNumber = (value, fallback, fieldName, max = Number.MAX_SAFE_INTEGER) => {
  if (value === undefined) {
    return { value: fallback };
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > max) {
    return { error: `${fieldName} must be a positive integer.` };
  }

  return { value: parsed };
};

const getCompanyProfileForUser = async (userId) => {
  const result = await pool.query(
    `
      SELECT id, user_id, company_name
      FROM company_profiles
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId],
  );

  return result.rows[0] || null;
};

const getOwnedJobById = async (jobId) => {
  const result = await pool.query(
    `
      SELECT
        j.*,
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

const buildJobPayload = (input) => {
  const title = input.title === undefined ? undefined : input.title?.trim();
  const description = input.description === undefined ? undefined : input.description?.trim();
  const requirements = input.requirements === undefined ? undefined : input.requirements?.trim();
  const location = input.location === undefined ? undefined : input.location?.trim();
  const employmentTypeRaw = input.employment_type === undefined ? undefined : input.employment_type;
  const status = input.status === undefined ? undefined : input.status?.trim();

  if (title !== undefined && !title) {
    return { error: 'Job title is required.' };
  }

  if (description !== undefined && !description) {
    return { error: 'Job description is required.' };
  }

  let employmentType = employmentTypeRaw;

  if (employmentTypeRaw !== undefined && employmentTypeRaw !== null && employmentTypeRaw !== '') {
    employmentType = employmentTypeRaw.trim().toLowerCase();

    if (!ALLOWED_EMPLOYMENT_TYPES.has(employmentType)) {
      return { error: 'employment_type is invalid.' };
    }
  }

  return {
    value: {
      title,
      description,
      requirements: requirements === '' ? null : requirements,
      salary_min: input.salary_min,
      salary_max: input.salary_max,
      location: location === '' ? null : location,
      employment_type: employmentTypeRaw === '' ? null : employmentType,
      status: status === '' ? null : status,
    },
  };
};

const validateSalaryRange = (salaryMin, salaryMax) => {
  if (
    salaryMin !== null &&
    salaryMin !== undefined &&
    salaryMax !== null &&
    salaryMax !== undefined &&
    salaryMax < salaryMin
  ) {
    return 'salary_max must be greater than or equal to salary_min.';
  }

  return null;
};

const getAllJobs = async (req, res) => {
  if (sendValidationError(req, res)) {
    return;
  }

  const pageResult = parsePaginationNumber(req.query.page, 1, 'page');
  const limitResult = parsePaginationNumber(req.query.limit, 10, 'limit', 100);

  if (pageResult.error || limitResult.error) {
    return res.status(400).json({
      success: false,
      message: pageResult.error || limitResult.error,
    });
  }

  const salaryMinResult = parseOptionalNonNegativeInteger(req.query.salary_min, 'salary_min');
  const salaryMaxResult = parseOptionalNonNegativeInteger(req.query.salary_max, 'salary_max');

  if (salaryMinResult.error || salaryMaxResult.error) {
    return res.status(400).json({
      success: false,
      message: salaryMinResult.error || salaryMaxResult.error,
    });
  }

  const page = pageResult.value;
  const limit = limitResult.value;
  const offset = (page - 1) * limit;
  const search = req.query.search?.trim();
  const location = req.query.location?.trim();
  const employmentType = req.query.type?.trim().toLowerCase();
  const salaryMin = salaryMinResult.value;
  const salaryMax = salaryMaxResult.value;

  if (employmentType && !ALLOWED_EMPLOYMENT_TYPES.has(employmentType)) {
    return res.status(400).json({
      success: false,
      message: 'type is invalid.',
    });
  }

  const filters = [`j.status = 'active'`];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    filters.push(
      `(j.title ILIKE $${params.length} OR j.description ILIKE $${params.length} OR cp.company_name ILIKE $${params.length})`,
    );
  }

  if (location) {
    params.push(`%${location}%`);
    filters.push(`j.location ILIKE $${params.length}`);
  }

  if (employmentType) {
    params.push(employmentType);
    filters.push(`j.employment_type = $${params.length}::emp_type`);
  }

  if (salaryMin !== null) {
    params.push(salaryMin);
    filters.push(`COALESCE(j.salary_max, j.salary_min, 0) >= $${params.length}`);
  }

  if (salaryMax !== null) {
    params.push(salaryMax);
    filters.push(`COALESCE(j.salary_min, j.salary_max, 0) <= $${params.length}`);
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  try {
    const countResult = await pool.query(
      `
        SELECT COUNT(*)::int AS total
        FROM jobs j
        INNER JOIN company_profiles cp ON cp.id = j.company_id
        ${whereClause}
      `,
      params,
    );

    const listParams = [...params, limit, offset];
    const jobsResult = await pool.query(
      `
        SELECT
          j.id,
          j.company_id,
          j.title,
          j.description,
          j.requirements,
          j.salary_min,
          j.salary_max,
          j.location,
          j.employment_type,
          j.status,
          j.created_at,
          cp.company_name,
          cp.logo_url
        FROM jobs j
        INNER JOIN company_profiles cp ON cp.id = j.company_id
        ${whereClause}
        ORDER BY j.created_at DESC
        LIMIT $${listParams.length - 1}
        OFFSET $${listParams.length}
      `,
      listParams,
    );

    const total = countResult.rows[0]?.total ?? 0;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: {
        jobs: jobsResult.rows,
        pagination: {
          total,
          page,
          totalPages,
        },
      },
      message: 'Jobs retrieved successfully.',
    });
  } catch (error) {
    console.error('getAllJobs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve jobs at this time.',
    });
  }
};

const getJobById = async (req, res) => {
  if (sendValidationError(req, res)) {
    return;
  }

  try {
    const result = await pool.query(
      `
        SELECT
          j.id,
          j.company_id,
          j.title,
          j.description,
          j.requirements,
          j.salary_min,
          j.salary_max,
          j.location,
          j.employment_type,
          j.status,
          j.created_at,
          cp.company_name,
          cp.description AS company_description,
          cp.website AS company_website,
          cp.location AS company_location,
          cp.logo_url
        FROM jobs j
        INNER JOIN company_profiles cp ON cp.id = j.company_id
        WHERE j.id = $1
        LIMIT 1
      `,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        job: result.rows[0],
      },
      message: 'Job retrieved successfully.',
    });
  } catch (error) {
    console.error('getJobById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve job at this time.',
    });
  }
};

const createJob = async (req, res) => {
  if (sendValidationError(req, res)) {
    return;
  }

  const salaryMinResult = parseOptionalNonNegativeInteger(req.body.salary_min, 'salary_min');
  const salaryMaxResult = parseOptionalNonNegativeInteger(req.body.salary_max, 'salary_max');

  if (salaryMinResult.error || salaryMaxResult.error) {
    return res.status(400).json({
      success: false,
      message: salaryMinResult.error || salaryMaxResult.error,
    });
  }

  const payloadResult = buildJobPayload({
    ...req.body,
    salary_min: salaryMinResult.value,
    salary_max: salaryMaxResult.value,
  });

  if (payloadResult.error) {
    return res.status(400).json({
      success: false,
      message: payloadResult.error,
    });
  }

  const payload = payloadResult.value;

  if (!payload.title || !payload.description) {
    return res.status(400).json({
      success: false,
      message: 'title and description are required.',
    });
  }

  const salaryRangeError = validateSalaryRange(payload.salary_min, payload.salary_max);

  if (salaryRangeError) {
    return res.status(400).json({
      success: false,
      message: salaryRangeError,
    });
  }

  try {
    const companyProfile = await getCompanyProfileForUser(req.user.id);

    if (!companyProfile) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found for this user.',
      });
    }

    const result = await pool.query(
      `
        INSERT INTO jobs (
          company_id,
          title,
          description,
          requirements,
          salary_min,
          salary_max,
          location,
          employment_type,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::emp_type, COALESCE($9, 'active'))
        RETURNING *
      `,
      [
        companyProfile.id,
        payload.title,
        payload.description,
        payload.requirements ?? null,
        payload.salary_min,
        payload.salary_max,
        payload.location ?? null,
        payload.employment_type ?? null,
        payload.status,
      ],
    );

    return res.status(201).json({
      success: true,
      data: {
        job: result.rows[0],
      },
      message: 'Job created successfully.',
    });
  } catch (error) {
    console.error('createJob error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to create job at this time.',
    });
  }
};

const updateJob = async (req, res) => {
  if (sendValidationError(req, res)) {
    return;
  }

  try {
    const existingJob = await getOwnedJobById(req.params.id);

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    if (existingJob.owner_user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this job.',
      });
    }

    const salaryMinResult = parseOptionalNonNegativeInteger(req.body.salary_min, 'salary_min');
    const salaryMaxResult = parseOptionalNonNegativeInteger(req.body.salary_max, 'salary_max');

    if (salaryMinResult.error || salaryMaxResult.error) {
      return res.status(400).json({
        success: false,
        message: salaryMinResult.error || salaryMaxResult.error,
      });
    }

    const payloadResult = buildJobPayload({
      ...req.body,
      salary_min: salaryMinResult.value === null ? undefined : salaryMinResult.value,
      salary_max: salaryMaxResult.value === null ? undefined : salaryMaxResult.value,
    });

    if (payloadResult.error) {
      return res.status(400).json({
        success: false,
        message: payloadResult.error,
      });
    }

    const payload = payloadResult.value;
    const fields = [];
    const values = [];

    const assignField = (column, value, cast = '') => {
      values.push(value);
      fields.push(`${column} = $${values.length}${cast}`);
    };

    if (payload.title !== undefined) {
      assignField('title', payload.title);
    }

    if (payload.description !== undefined) {
      assignField('description', payload.description);
    }

    if (payload.requirements !== undefined) {
      assignField('requirements', payload.requirements);
    }

    if (payload.salary_min !== undefined) {
      assignField('salary_min', payload.salary_min);
    }

    if (payload.salary_max !== undefined) {
      assignField('salary_max', payload.salary_max);
    }

    if (payload.location !== undefined) {
      assignField('location', payload.location);
    }

    if (payload.employment_type !== undefined) {
      assignField('employment_type', payload.employment_type, '::emp_type');
    }

    if (payload.status !== undefined) {
      assignField('status', payload.status);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one field is required to update a job.',
      });
    }

    const nextSalaryMin = payload.salary_min !== undefined ? payload.salary_min : existingJob.salary_min;
    const nextSalaryMax = payload.salary_max !== undefined ? payload.salary_max : existingJob.salary_max;
    const salaryRangeError = validateSalaryRange(nextSalaryMin, nextSalaryMax);

    if (salaryRangeError) {
      return res.status(400).json({
        success: false,
        message: salaryRangeError,
      });
    }

    values.push(req.params.id);

    const result = await pool.query(
      `
        UPDATE jobs
        SET ${fields.join(', ')}
        WHERE id = $${values.length}
        RETURNING *
      `,
      values,
    );

    return res.status(200).json({
      success: true,
      data: {
        job: result.rows[0],
      },
      message: 'Job updated successfully.',
    });
  } catch (error) {
    console.error('updateJob error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to update job at this time.',
    });
  }
};

const deleteJob = async (req, res) => {
  if (sendValidationError(req, res)) {
    return;
  }

  try {
    const existingJob = await getOwnedJobById(req.params.id);

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    if (existingJob.owner_user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this job.',
      });
    }

    await pool.query('DELETE FROM jobs WHERE id = $1', [req.params.id]);

    return res.status(200).json({
      success: true,
      data: {
        id: req.params.id,
      },
      message: 'Job deleted successfully.',
    });
  } catch (error) {
    console.error('deleteJob error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to delete job at this time.',
    });
  }
};

const getJobApplicants = async (req, res) => {
  if (sendValidationError(req, res)) {
    return;
  }

  try {
    const existingJob = await getOwnedJobById(req.params.id);

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    if (existingJob.owner_user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view applicants for this job.',
      });
    }

    const result = await pool.query(
      `
        SELECT
          a.id,
          a.job_id,
          a.applicant_id,
          u.name AS applicant_name,
          u.email AS applicant_email,
          a.resume_url,
          a.application_status AS status,
          a.applied_at
        FROM applications a
        INNER JOIN users u ON u.id = a.applicant_id
        WHERE a.job_id = $1
        ORDER BY a.applied_at DESC
      `,
      [req.params.id],
    );

    return res.status(200).json({
      success: true,
      data: {
        applicants: result.rows,
      },
      message: 'Applicants retrieved successfully.',
    });
  } catch (error) {
    console.error('getJobApplicants error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve applicants at this time.',
    });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobApplicants,
};
