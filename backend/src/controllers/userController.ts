import { Response } from 'express';
import { db } from '../database';
import { sendError } from '../utils/error';
import { AuthenticatedRequest } from '../types';
import bcrypt from 'bcryptjs';

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 'AUTH_REQUIRED', 401);
  }

  try {
    const result = await db.query(
      `SELECT id, email, first_name, last_name, phone_number, date_of_birth, 
       gender, country, preferred_language, profile_photo_url, bio,
       emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
       created_at, updated_at
       FROM profiles WHERE id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'Profile not found', 'PROFILE_NOT_FOUND', 404);
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    sendError(res, 'Error fetching profile', 'PROFILE_FETCH_FAILED');
  }
};

export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 'AUTH_REQUIRED', 401);
  }

  const {
    first_name,
    last_name,
    phone_number,
    date_of_birth,
    gender,
    country,
    preferred_language,
    profile_photo_url,
    bio,
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_relationship
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE profiles SET 
       first_name = COALESCE($1, first_name),
       last_name = COALESCE($2, last_name),
       phone_number = COALESCE($3, phone_number),
       date_of_birth = COALESCE($4, date_of_birth),
       gender = COALESCE($5, gender),
       country = COALESCE($6, country),
       preferred_language = COALESCE($7, preferred_language),
       profile_photo_url = COALESCE($8, profile_photo_url),
       bio = COALESCE($9, bio),
       emergency_contact_name = COALESCE($10, emergency_contact_name),
       emergency_contact_phone = COALESCE($11, emergency_contact_phone),
       emergency_contact_relationship = COALESCE($12, emergency_contact_relationship),
       updated_at = NOW()
       WHERE id = $13
       RETURNING id, first_name, last_name, email`,
      [
        first_name, last_name, phone_number, date_of_birth, gender,
        country, preferred_language, profile_photo_url, bio,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
        req.user.userId
      ]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'Profile not found', 'PROFILE_NOT_FOUND', 404);
    }

    res.json({
      message: 'Profile updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    sendError(res, 'Error updating profile', 'PROFILE_UPDATE_FAILED');
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 'AUTH_REQUIRED', 401);
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return sendError(res, 'Current password and new password are required', 'VALIDATION_ERROR', 400);
  }

  if (newPassword.length < 8) {
    return sendError(res, 'New password must be at least 8 characters long', 'VALIDATION_ERROR', 400);
  }

  try {
    // Get current password hash
    const userResult = await db.query(
      'SELECT password_hash FROM profiles WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      return sendError(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isValid) {
      return sendError(res, 'Current password is incorrect', 'INVALID_PASSWORD', 400);
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.query(
      'UPDATE profiles SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, req.user.userId]
    );

    // Invalidate all user sessions except current one
    await db.query(
      'UPDATE user_sessions SET is_active = false WHERE profile_id = $1',
      [req.user.userId]
    );

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    sendError(res, 'Error changing password', 'PASSWORD_CHANGE_FAILED');
  }
};

export const updateNotificationSettings = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 'AUTH_REQUIRED', 401);
  }

  const {
    email_notifications,
    sms_notifications,
    session_reminders,
    marketing_emails,
    security_alerts
  } = req.body;

  try {
    // Check if notification settings exist
    const existingSettings = await db.query(
      'SELECT id FROM notification_settings WHERE profile_id = $1',
      [req.user.userId]
    );

    if (existingSettings.rows.length === 0) {
      // Create new notification settings
      await db.query(
        `INSERT INTO notification_settings 
         (profile_id, email_notifications, sms_notifications, session_reminders, marketing_emails, security_alerts)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [req.user.userId, email_notifications, sms_notifications, session_reminders, marketing_emails, security_alerts]
      );
    } else {
      // Update existing notification settings
      await db.query(
        `UPDATE notification_settings SET 
         email_notifications = COALESCE($1, email_notifications),
         sms_notifications = COALESCE($2, sms_notifications),
         session_reminders = COALESCE($3, session_reminders),
         marketing_emails = COALESCE($4, marketing_emails),
         security_alerts = COALESCE($5, security_alerts),
         updated_at = NOW()
         WHERE profile_id = $6`,
        [email_notifications, sms_notifications, session_reminders, marketing_emails, security_alerts, req.user.userId]
      );
    }

    res.json({
      message: 'Notification settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    sendError(res, 'Error updating notification settings', 'NOTIFICATION_UPDATE_FAILED');
  }
};

export const getNotificationSettings = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 'AUTH_REQUIRED', 401);
  }

  try {
    const result = await db.query(
      `SELECT email_notifications, sms_notifications, session_reminders, marketing_emails, security_alerts
       FROM notification_settings WHERE profile_id = $1`,
      [req.user.userId]
    );

    // Return default settings if none exist
    const defaultSettings = {
      email_notifications: true,
      sms_notifications: false,
      session_reminders: true,
      marketing_emails: false,
      security_alerts: true
    };

    const settings = result.rows.length > 0 ? result.rows[0] : defaultSettings;
    
    res.json({ data: settings });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    sendError(res, 'Error fetching notification settings', 'NOTIFICATION_FETCH_FAILED');
  }
};
