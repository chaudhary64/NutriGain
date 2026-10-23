import mongoose from 'mongoose';
import { MICRO_UNITS, MICRO_SOURCES, MICRO_BASES } from '../lib/micros.js';

/**
 * Micronutrient values attached to a food or a logged entry.
 *
 * Kept as a list of { key, amount, unit } rather than fixed columns: the set of
 * tracked nutrients should be able to grow without a migration, and a nutrient
 * that a source never reported must stay absent rather than becoming 0 —
 * "unmeasured" and "none" are different answers.
 *
 * Keys are canonical snake_case names (`vitamin_d`, `b12`, `folate`, `iron`).
 * Amounts are per the profile's `basis`, in the unit stored alongside them.
 */

export { MICRO_UNITS, MICRO_SOURCES, MICRO_BASES };

const MicroValueSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 40,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      enum: MICRO_UNITS,
      default: 'mg',
    },
  },
  { _id: false }
);

const MicroProfileSchema = new mongoose.Schema(
  {
    values: {
      type: [MicroValueSchema],
      default: [],
    },
    source: {
      type: String,
      enum: MICRO_SOURCES,
    },
    basis: {
      type: String,
      enum: MICRO_BASES,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

export { MicroProfileSchema };
export default MicroProfileSchema;
