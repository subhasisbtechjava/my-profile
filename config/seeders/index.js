const bcrypt = require("bcryptjs");
const User = require("../../module/authentication/models/user.model");
const Event = require("../../module/event/models/event.model");

const seedMasterData = async () => {
  try {
    const userCount = await User.count();
    if (userCount === 0) {
      console.log("[Seed] Seeding initial users...");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Admin@12345", salt);

      const adminUser = await User.create({
        name: "Admin User",
        email: "admin@eventplanner.com",
        password: hashedPassword,
        phone: "+1234567890",
        role: "admin",
        status: "active",
      });

      const organizerUser = await User.create({
        name: "Sarah Organizer",
        email: "sarah@eventplanner.com",
        password: hashedPassword,
        phone: "+1987654321",
        role: "organizer",
        status: "active",
      });

      console.log("[Seed] Seeding sample events...");
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);

      await Event.create({
        title: "Global Tech Summit 2026",
        description: "Explore the latest innovations in AI, cloud computing, and software engineering.",
        category: "Technology",
        venue_name: "Grand Convention Center",
        address: "100 Tech Blvd",
        city: "San Francisco",
        start_time: tomorrow,
        end_time: dayAfter,
        capacity: 250,
        registered_count: 0,
        ticket_price: 99.0,
        status: "published",
        organizer_id: organizerUser.id,
      });

      await Event.create({
        title: "International Music & Arts Gala",
        description: "An evening celebrating indie music, visual art exhibits, and live acoustic performances.",
        category: "Music",
        venue_name: "Symphony Hall",
        address: "45 Harmony Square",
        city: "New York",
        start_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 3600 * 1000),
        capacity: 500,
        registered_count: 0,
        ticket_price: 49.5,
        status: "published",
        organizer_id: organizerUser.id,
      });

      console.log("[Seed] Initial master data seeded successfully!");
    }
  } catch (error) {
    console.error("[Seed] Error in seeding master data:", error.message);
  }
};

module.exports = seedMasterData;
