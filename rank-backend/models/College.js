const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema(
  {
    // ── Publishing ──
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ── Core Identity ──
    college_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    college_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },

    // ── Location ──
    location: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },

    // ── Academic Info ──
    established_year: {
      type: Number,
      default: null,
    },
    ranking: {
      type: String,
      trim: true,
      default: '',
    },
    accreditation: {
      type: String,
      trim: true,
      default: '',
    },
    affiliation: {
      type: String,
      default: '',
    },
    mode_of_admission: {
      type: String,
      trim: true,
      default: '',
    },

    // ── Fees & Courses ──
    fees: {
      type: String,
      default: '',
    },
    courses_offered: {
      type: String,
      default: '',
    },
    courses: [
      {
        name: { type: String, required: true },
        code: { type: String, required: true },
        group: { type: String, default: '' },
        cutoffs: { type: mongoose.Schema.Types.Mixed, default: {} },
      }
    ],

    // ── Facilities ──
    facilities: {
      type: String,
      default: '',
    },

    // ── Media & Contact ──
    photo_url: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    contact_email: {
      type: String,
      trim: true,
      default: '',
    },
    contact_phone: {
      type: String,
      trim: true,
      default: '',
    },

    // ── Placement Details (all optional) ──
    placement_rate: {
      type: String,
      default: '',
    },
    highest_package: {
      type: String,
      default: '',
    },
    average_package: {
      type: String,
      default: '',
    },
    median_package: {
      type: String,
      default: '',
    },
    branchwise_placement: {
      type: String,
      default: '',
    },
    companies_visited: {
      type: String,
      default: '',
    },
    offers_made: {
      type: String,
      default: '',
    },
    total_internships: {
      type: String,
      default: '',
    },
    top_recruiters: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

module.exports = mongoose.model('College', collegeSchema);
