const http = require("http");
const { connectDB, sequelize } = require("../config/db.config");
const User = require("../module/authentication/models/user.model");
const Event = require("../module/event/models/event.model");
const Attendee = require("../module/attendee/models/attendee.model");

const test = async () => {
  try {
    console.log("Step 1: Connecting to PostgreSQL database...");
    await connectDB();
    console.log("Step 1 SUCCESS: DB connected and synchronized!");

    console.log("Step 2: Checking models exist in database...");
    const userCount = await User.count();
    const eventCount = await Event.count();
    const attendeeCount = await Attendee.count();
    console.log(`Step 2 SUCCESS: Users=${userCount}, Events=${eventCount}, Attendees=${attendeeCount}`);

    console.log("All database verification checks passed successfully!");
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error("Verification failed:", err);
    process.exit(1);
  }
};

test();
