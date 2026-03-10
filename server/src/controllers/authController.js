const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const ALLOWED_REGISTER_ROLES = new Set(['applicant', 'company']);
const JWT_EXPIRES_IN = '7d';
const PASSWORD_SALT_ROUNDS = 12;

const buildUserPayload = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  created_at: user.created_at,
});

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required.');
  }

  return jwt.sign(buildUserPayload(user), process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

const register = async (req, res, next) => {
  const name = req.body.name.trim();
  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;
  const role = req.body.role.trim().toLowerCase();

  if (!ALLOWED_REGISTER_ROLES.has(role)) {
    return res.status(400).json({
      success: false,
      message: 'Role must be either applicant or company.',
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existingUserResult = await client.query(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [email],
    );

    if (existingUserResult.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    const userInsertResult = await client.query(
      `
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, $4::user_role)
        RETURNING id, name, email, role, created_at
      `,
      [name, email, passwordHash, role],
    );

    const user = userInsertResult.rows[0];

    if (role === 'applicant') {
      await client.query(
        'INSERT INTO applicant_profiles (user_id) VALUES ($1)',
        [user.id],
      );
    }

    if (role === 'company') {
      await client.query(
        'INSERT INTO company_profiles (user_id, company_name) VALUES ($1, $2)',
        [user.id, user.name],
      );
    }

    const token = signToken(user);

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      data: {
        token,
        user,
      },
      message: 'User registered successfully.',
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (_rollbackError) {
      // Ignore rollback errors to preserve the original failure.
    }

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    return next(error);
  } finally {
    client.release();
  }
};

const login = async (req, res, next) => {
  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;

  try {
    const userResult = await pool.query(
      `
        SELECT id, name, email, password_hash, role, created_at
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [email],
    );

    if (userResult.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    };

    const token = signToken(safeUser);

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: safeUser,
      },
      message: 'Login successful.',
    });
  } catch (error) {
    return next(error);
  }
};

const getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication is required.',
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
    message: 'Current user retrieved successfully.',
  });
};

module.exports = {
  register,
  login,
  getMe,
};
