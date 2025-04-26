const mongoose = require('mongoose');

/**
 * UserTokenRequest Schema
 * ---------------------------------------------
 * This schema handles the access token lifecycle for students
 * in the Internship Program Management System.
 *
 * Fields:
 * - fullName: Student's full name.
 * - password: Encrypted password for login authentication.
 * - ouEmail: Unique OU email for login.
 * - soonerId: Unique 9-character ID assigned to the student.
 * - semester: The semester in which the internship is active.
 * - academicAdvisor: Reference to the academic advisor (if using a separate collection).
 * - token: Unique access token used for login.
 * - isActivated: Whether the token has been activated.
 * - requestedAt: When the request was made.
 * - activatedAt: When the token was activated.
 * - expiresAt: Auto-calculated 6 months from requestedAt.
 * - deletedAt: Marks soft deletion if the student cancels.
 * - status: Optional string enum for tracking token state.
 * - activationLinkSentAt: Timestamp when the activation email was sent.
 *
 * Additional Features:
 * - Automatically sets `expiresAt` to 6 months from `requestedAt`.
 * - Uses `timestamps` to auto-generate `createdAt` and `updatedAt`.
 * - `ouEmail` and `token` are unique.
 * - Partial TTL index for auto-deletion of inactive token requests 
 *   5 days (432000 seconds) after `requestedAt` if not activated.
 */

const userTokenRequestSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      trim: true,
    },
    ouEmail: {
      type: String,
      required: [true, 'OU email is required'],
      unique: true,
      lowercase: true,
      match: [/^[\w-.]+@ou\.edu$/, 'Email must be a valid OU address'],
    },
    soonerId: {
      type: String,
      required: function () {
        return this.role === 'student';
      },
      unique: true,
      match: [/^\d{9}$/, 'Sooner ID must be exactly 9 digits'],
    },
    role: {
      type: String,
      required: true,
      enum: ['student', 'supervisor', 'coordinator'],
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
    },
    academicAdvisor: {
      type: String,
      required: function () {
        return this.role === "student"; 
      }
    },
    isStudent: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
      required: function () {
        return this.isStudent;
      },
      unique: true,
    },
    isActivated: {
      type: Boolean,
      default: false,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    activatedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
    activationLinkSentAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'activated', 'expired', 'deleted', 'deactivated'],
      default: 'pending',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields automatically
  }
);

// Automatically set expiresAt to 5 days after requestedAt
userTokenRequestSchema.pre('save', function (next) {
  if (!this.expiresAt) {
    const fiveDaysLater = new Date(this.requestedAt);
    fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);
    this.expiresAt = fiveDaysLater;
  }
  next();
});

userTokenRequestSchema.index(
  { requestedAt: 1 },
  {
    expireAfterSeconds: 432000,
    partialFilterExpression: { isActivated: false },
  }
);

module.exports = mongoose.model('UserTokenRequest', userTokenRequestSchema);