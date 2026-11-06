const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db.config");
const User = require("../../authentication/models/user.model");
const Event = require("../../event/models/event.model");

const Attendee = sequelize.define(
  "Attendee",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "events",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    ticket_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    status: {
      type: DataTypes.ENUM("confirmed", "cancelled", "waitlist"),
      defaultValue: "confirmed",
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "completed", "refunded", "free"),
      defaultValue: "free",
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "attendees",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Establish relationships
User.hasMany(Attendee, { foreignKey: "user_id", as: "bookings" });
Attendee.belongsTo(User, { foreignKey: "user_id", as: "user" });

Event.hasMany(Attendee, { foreignKey: "event_id", as: "attendees" });
Attendee.belongsTo(Event, { foreignKey: "event_id", as: "event" });

module.exports = Attendee;
