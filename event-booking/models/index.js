const User = require('./User');
const Event = require('./Event');
const Booking = require('./Booking');

// User - Event relationship (Creator)
User.hasMany(Event, { foreignKey: 'createdById', as: 'createdEvents' });
Event.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

// User - Booking relationship
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Event - Booking relationship
Event.hasMany(Booking, { foreignKey: 'eventId', as: 'bookings' });
Booking.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

module.exports = {
    User,
    Event,
    Booking
};
