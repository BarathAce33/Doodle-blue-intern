module.exports = { // Centralized app constants
    // Roles
    ROLES: {
        ADMIN: 'Admin',
        CUSTOMER: 'Customer'
    },

    // Booking Status
    BOOKING_STATUS: {
        GOING: 'going',
        CANCELED: 'canceled'
    },

    // Success Messages
    SUCCESS: {
        PASSWORD_CHANGED: 'Password changed successfully',
        PROFILE_UPDATED: 'Profile updated successfully',
        EMAIL_SENT: 'Email sent successfully',
        RESET_SUCCESS: 'Password reset successful',
        OTP_SENT: 'OTP sent successfully',
        OTP_VERIFIED: 'OTP verified successfully',
        JOINED: 'Event joined successfully',
        BOOKING_CONFIRMED: 'Booking confirmation email sent',
        MY_EVENTS: 'Fetched my events successfully',
        REGISTERED: 'User registered successfully',
        LOGGED_IN: 'Logged in successfully'
    },

    // Error Messages
    ERRORS: {
        UNAUTHORIZED: 'Unauthorized access',
        LOGIN_FAILED: 'Login failed: Invalid credentials',
        USER_NOT_FOUND: 'User not found',
        EVENT_NOT_FOUND: 'Event not found',
        BOOKING_NOT_FOUND: 'Booking not found',
        OVERLAP: 'Event timings overlap with an existing booking',
        CANCEL_LIMIT: 'Cannot cancel event within 8 hours of start time',
        INVALID_TOKEN: 'Invalid or expired token',
        INVALID_OTP: 'Invalid or expired OTP',
        PASSWORDS_DONT_MATCH: 'Passwords do not match',
        SERVER_ERROR: 'Internal server error'
    },

    // Default Values
    DEFAULTS: {
        PAGINATION_LIMIT: 10,
        RADIUS_KM: 30
    }
};
