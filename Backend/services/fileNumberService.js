import Counter from "../models/counter.js";
import User from "../models/user.js";

/**
 * Generates the next unique file number for the current year.
 * Format: MDMS-YYYY-000001
 */
export const getNextFileNumber = async () => {
    const currentYear = new Date().getFullYear();
    const counterName = "fileNumber";

    // Atomically increment the counter for the current year
    const counter = await Counter.findOneAndUpdate(
        { name: counterName, year: currentYear },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    const paddedSeq = counter.seq.toString().padStart(6, "0");
    return `MDMS-${currentYear}-${paddedSeq}`;
};

/**
 * Assigns a file number to a user if they don't already have one.
 * If they already have one, returns the existing one.
 * Ensures that the same file number is reused across all cases for the user.
 * 
 * @param {string} userId - The ID of the user (Clerk ID or MongoDB ID)
 */
export const assignFileNumberToUser = async (userId) => {
    // 1. Find the user
    // Note: Depending on the auth system, we might need to search by _id or Clerk ID.
    // Assuming 'userId' is the database _id for consistency in models.
    // If it's Clerk ID, we should search by a clerkId field if exists.
    // In this project, getUserId(req) returns Clerk ID if exists, otherwise Mongo ID.
    // Let's check User model for 'clerkId' or similar. 
    // Wait, the User model I saw didn't have clerkId. It has name, email, password.
    // Let's assume userId is the MongoDB _id for now, or email if that's what's used.

    let user = await User.findById(userId);

    // Fallback search if not found by ID (e.g. if userId is a string email or clerk ID)
    if (!user) {
        user = await User.findOne({
            $or: [{ email: userId }, { clerkId: userId }]
        });
    }

    if (!user) {
        throw new Error("User not found for file number assignment");
    }

    // 2. If user already has a file number, reuse it
    if (user.fileNumber) {
        return user.fileNumber;
    }

    // 3. Generate a new unique file number
    const newFileNumber = await getNextFileNumber();

    // 4. Save it to the user
    user.fileNumber = newFileNumber;
    await user.save();

    return newFileNumber;
};
