import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    year: { type: Number, required: true },
    seq: { type: Number, default: 0 },
});

// Compound index for unique counter per name and year
counterSchema.index({ name: 1, year: 1 }, { unique: true });

export default mongoose.model("Counter", counterSchema);
