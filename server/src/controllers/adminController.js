const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;
const { User, TeacherInvitation, Course, Assignment, SubjectAssignment, Subject } = require('../models');
const { Op } = require('sequelize');
const { sendTeacherInvitation } = require('../services/emailService');

const uploadsDir = path.resolve(__dirname, '../../uploads');

const detectMimeType = (filename) => {
  const ext = path.extname(filename || '').toLowerCase();
  const mapping = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.txt': 'text/plain',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.zip': 'application/zip'
  };
  return mapping[ext] || 'application/octet-stream';
};

const parseAttachments = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) { return []; }
  }
  return [];
};

const buildAttachmentPayload = (filename, originalName) => {
  const absolutePath = path.join(uploadsDir, filename);
  const displayName = originalName || filename;
  const mimeType = detectMimeType(filename);
  return {
    fileName: filename, filename,
    originalName: displayName, originalname: displayName,
    filePath: absolutePath, path: absolutePath,
    fileSize: null, fileSizeBytes: null,
    mimeType, mimetype: mimeType
  };
};

// ─── Invite a teacher ─────────────────────────────────────────────────────────
const inviteTeacher = async (req, res) => {
  try {
    const { email, firstName, lastName, courseField } = req.body;
    const adminId = req.user.id;

    // Check if email is already a registered user
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered as a user' });
    }

    // Delete any old invitations for this email (allow re-sending)
    const deletedCount = await TeacherInvitation.destroy({ where: { email } });
    if (deletedCount > 0) {
      console.log(`♻️  Replaced ${deletedCount} old invitation(s) for ${email}`);
    }

    // Generate token, set 7-day expiry
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save invitation
    const invitation = await TeacherInvitation.create({
      email, firstName, lastName, courseField,
      invitationToken, invitedBy: adminId,
      expiresAt, status: 'pending'
    });

    // The teacher clicks this link → shows TeacherRegisterPage → "Accept with Google"
    const invitationLink = `${process.env.CLIENT_URL}/register/teacher/${invitationToken}`;

    // Send invitation email
    const emailResult = await sendTeacherInvitation({
      email, firstName, lastName, invitationLink, expiresAt
    });

    // Friendly email error reporting
    let emailMessage = '';
    let emailError = null;
    if (emailResult.success) {
      emailMessage = `Invitation email sent to ${email}`;
      console.log(`✅ Teacher invitation email sent to ${email}`);
    } else {
      emailMessage = 'Invitation saved but email could not be sent — see emailError for details';
      emailError = emailResult.error;
      console.error(`❌ Email send failed for ${email}:`, emailResult.error);

      // Give admin a helpful hint
      if (emailResult.error?.includes('Invalid login') || emailResult.error?.includes('Username and Password')) {
        emailError = 'Gmail authentication failed. Make sure EMAIL_PASSWORD in .env is a 16-character Gmail App Password (not your regular Gmail password). Get one at: https://myaccount.google.com/apppasswords';
      } else if (emailResult.error?.includes('not configured')) {
        emailError = 'EMAIL_USER and EMAIL_PASSWORD are not set in .env. Please configure them to enable email sending.';
      }
    }

    res.status(201).json({
      message: emailMessage,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        courseField: invitation.courseField,
        status: invitation.status,
        expiresAt: invitation.expiresAt
      },
      invitationLink,
      emailSent: emailResult.success,
      ...(emailError ? { emailError } : {})
    });
  } catch (error) {
    console.error('Invite teacher error:', error);
    res.status(500).json({ message: 'Error creating teacher invitation' });
  }
};

// ─── Get all teacher invitations ──────────────────────────────────────────────
const getInvitations = async (req, res) => {
  try {
    const invitations = await TeacherInvitation.findAll({
      include: [{ model: User, as: 'admin', attributes: ['id', 'firstName', 'lastName', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(invitations);
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ message: 'Error fetching invitations' });
  }
};

// ─── Get all teachers ─────────────────────────────────────────────────────────
const getTeachers = async (req, res) => {
  try {
    const teachers = await User.findAll({
      where: { role: 'teacher' },
      attributes: ['id', 'firstName', 'lastName', 'email', 'isActive', 'createdAt', 'profilePicture', 'courseField'],
      order: [['createdAt', 'DESC']]
    });
    res.json(teachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ message: 'Error fetching teachers' });
  }
};

// ─── Toggle teacher active/inactive ──────────────────────────────────────────
const toggleTeacherStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await User.findOne({ where: { id, role: 'teacher' } });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    teacher.isActive = !teacher.isActive;
    await teacher.save();

    res.json({
      message: `Teacher ${teacher.isActive ? 'activated' : 'deactivated'} successfully`,
      teacher: { id: teacher.id, firstName: teacher.firstName, lastName: teacher.lastName, email: teacher.email, isActive: teacher.isActive }
    });
  } catch (error) {
    console.error('Toggle teacher status error:', error);
    res.status(500).json({ message: 'Error updating teacher status' });
  }
};

// ─── Revoke invitation ────────────────────────────────────────────────────────
const revokeInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const invitation = await TeacherInvitation.findByPk(id);
    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });
    if (invitation.status !== 'pending') return res.status(400).json({ message: 'Can only revoke pending invitations' });

    invitation.status = 'expired';
    await invitation.save();
    res.json({ message: 'Invitation revoked successfully' });
  } catch (error) {
    console.error('Revoke invitation error:', error);
    res.status(500).json({ message: 'Error revoking invitation' });
  }
};

// ─── Get invitation details by token (for the accept page) ────────────────────
const getInvitationByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const invitation = await TeacherInvitation.findOne({
      where: { invitationToken: token, status: 'pending', expiresAt: { [Op.gt]: new Date() } },
      attributes: ['email', 'firstName', 'lastName', 'courseField', 'expiresAt']
    });
    if (!invitation) return res.status(400).json({ message: 'Invalid or expired invitation token' });
    res.json(invitation);
  } catch (error) {
    console.error('Get invitation error:', error);
    res.status(500).json({ message: 'Error fetching invitation' });
  }
};

// ─── Register teacher (kept for backward compat — now done via Google OAuth) ──
const registerTeacher = async (req, res) => {
  // This endpoint is no longer the primary path.
  // Teachers now accept invites via Google OAuth (TeacherRegisterPage → Google Sign-In).
  res.status(410).json({
    message: 'Password-based teacher registration is disabled. Teachers must accept invitations via Google OAuth.',
    hint: 'Visit the invitation link and click "Accept with Google".'
  });
};

// ─── Admin: create course ─────────────────────────────────────────────────────
const createCourse = async (req, res) => {
  try {
    const { title, description, code, startDate, endDate, enrollmentLimit, teacherId, courseField } = req.body;
    if (!teacherId) return res.status(400).json({ message: 'Teacher ID is required' });
    if (!courseField) return res.status(400).json({ message: 'Course field (e.g., B.Tech, BCA) is required' });

    const teacher = await User.findOne({ where: { id: teacherId, role: 'teacher', isActive: true } });
    if (!teacher) return res.status(404).json({ message: 'Active teacher not found' });

    const existingCourse = await Course.findOne({ where: { code } });
    if (existingCourse) return res.status(400).json({ message: 'Course code already exists' });

    const course = await Course.create({
      title, description, code, startDate, endDate,
      enrollmentLimit, courseField, teacherId, isPublished: true
    });

    const createdCourse = await Course.findOne({
      where: { id: course.id },
      include: [{ model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName', 'email'] }]
    });

    res.status(201).json({ message: 'Course created and assigned successfully', course: createdCourse });
  } catch (error) {
    console.error('Admin create course error:', error);
    res.status(500).json({ message: 'Error creating course' });
  }
};

// ─── Delete teacher ───────────────────────────────────────────────────────────
const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await User.findOne({ where: { id, role: 'teacher' } });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const courses = await Course.findAll({ where: { teacherId: id } });
    if (courses.length > 0) {
      return res.status(400).json({
        message: `Cannot delete teacher — they have ${courses.length} course(s) assigned. Reassign or delete courses first.`,
        coursesCount: courses.length
      });
    }

    await teacher.destroy();
    res.json({ message: 'Teacher deleted successfully', success: true });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ message: 'Error deleting teacher' });
  }
};

// ─── Upload file list ─────────────────────────────────────────────────────────
const getUploadFiles = async (req, res) => {
  try {
    const search = (req.query.search || '').trim().toLowerCase();
    const entries = await fs.readdir(uploadsDir, { withFileTypes: true });

    let files = await Promise.all(
      entries.filter((e) => e.isFile()).map(async (e) => {
        const absolutePath = path.join(uploadsDir, e.name);
        const stats = await fs.stat(absolutePath);
        return { filename: e.name, size: stats.size, updatedAt: stats.mtime, mimeType: detectMimeType(e.name) };
      })
    );

    if (search) files = files.filter((f) => f.filename.toLowerCase().includes(search));
    files.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json({ files });
  } catch (error) {
    console.error('Get upload files error:', error);
    res.status(500).json({ message: 'Error fetching upload files' });
  }
};

// ─── Get all assignments ──────────────────────────────────────────────────────
const getAllAssignments = async (req, res) => {
  try {
    const type = (req.query.type || 'all').toLowerCase();
    const response = { courseAssignments: [], subjectAssignments: [] };

    if (type === 'all' || type === 'course') {
      const courseAssignments = await Assignment.findAll({
        include: [{ model: Course, attributes: ['id', 'title', 'code'] }],
        order: [['createdAt', 'DESC']], limit: 500
      });
      response.courseAssignments = courseAssignments.map((a) => {
        const json = a.toJSON();
        return {
          id: json.id, title: json.title, dueDate: json.dueDate,
          containerId: json.Course?.id || null,
          containerName: json.Course?.title || 'Unknown course',
          containerCode: json.Course?.code || '',
          attachmentCount: parseAttachments(json.attachments).length
        };
      });
    }

    if (type === 'all' || type === 'subject') {
      const subjectAssignments = await SubjectAssignment.findAll({
        include: [{ model: Subject, attributes: ['id', 'name', 'code'] }],
        order: [['createdAt', 'DESC']], limit: 500
      });
      response.subjectAssignments = subjectAssignments.map((a) => {
        const json = a.toJSON();
        return {
          id: json.id, title: json.title, dueDate: json.dueDate,
          containerId: json.Subject?.id || null,
          containerName: json.Subject?.name || 'Unknown subject',
          containerCode: json.Subject?.code || '',
          attachmentCount: parseAttachments(json.attachments).length
        };
      });
    }

    res.json(response);
  } catch (error) {
    console.error('Get all assignments error:', error);
    res.status(500).json({ message: 'Error fetching assignments' });
  }
};

// ─── Attach existing upload file to assignment ─────────────────────────────
const attachExistingFileToAssignment = async (req, res) => {
  try {
    const { type, assignmentId } = req.params;
    const { filename, originalName } = req.body;
    if (!filename || typeof filename !== 'string') return res.status(400).json({ message: 'filename is required' });

    const safeFilename = path.basename(filename.trim());
    if (!safeFilename || safeFilename !== filename.trim()) return res.status(400).json({ message: 'Invalid filename' });

    const filePath = path.join(uploadsDir, safeFilename);
    try { await fs.access(filePath); }
    catch (_) { return res.status(404).json({ message: 'File does not exist in uploads folder' }); }

    const assignmentType = String(type).toLowerCase();
    if (assignmentType !== 'course' && assignmentType !== 'subject')
      return res.status(400).json({ message: 'type must be "course" or "subject"' });

    const Model = assignmentType === 'course' ? Assignment : SubjectAssignment;
    const assignment = await Model.findByPk(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const existing = parseAttachments(assignment.attachments)
      .filter((a) => {
        if (!a) return false;
        if (typeof a === 'string') return path.basename(a) !== safeFilename;
        return ![a.fileName, a.filename, a.originalName, a.path, a.filePath]
          .some((v) => typeof v === 'string' && path.basename(v) === safeFilename);
      });

    existing.push(buildAttachmentPayload(safeFilename, originalName));
    await assignment.update({ attachments: existing });

    res.json({ message: 'File attached successfully', assignmentId: assignment.id, type: assignmentType, attachments: existing });
  } catch (error) {
    console.error('Attach existing file error:', error);
    res.status(500).json({ message: 'Error attaching file to assignment' });
  }
};

module.exports = {
  inviteTeacher, getInvitations, getTeachers, toggleTeacherStatus,
  revokeInvitation, registerTeacher, getInvitationByToken,
  createCourse, deleteTeacher, getUploadFiles,
  getAllAssignments, attachExistingFileToAssignment
};
