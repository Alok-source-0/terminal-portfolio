// 1. IMPORTS AND SETUP
// =============================================================================
// Must be the first line to ensure environment variables are available
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = process.env.PORT || 3000;

// 2. SESSION CONFIGURATION
// =============================================================================
// This sets up the session middleware.
// The secret is used to sign the session ID cookie, preventing tampering.
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if you're using HTTPS
}));

// 3. PASSPORT INITIALIZATION
// =============================================================================
// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

// 4. PASSPORT GOOGLE STRATEGY CONFIGURATION
// =============================================================================
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback" // This must match the URI in your Google Cloud Console
  },
  // This "verify" function is called when Google successfully authenticates the user.
  // The 'profile' object contains the user's Google profile information.
  (accessToken, refreshToken, profile, done) => {
    // In a real app, you would find or create a user in your database here.
    // For this example, we'll just pass the profile information along.
    console.log('Google profile:', profile);
    return done(null, profile);
  }
));

// 5. PASSPORT SERIALIZATION AND DESERIALIZATION
// =============================================================================
// Determines what user information should be stored in the session.
passport.serializeUser((user, done) => {
  done(null, user);
});

// Retrieves the user's information from the session.
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middleware to check if a user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

// 6. ROUTES
// =============================================================================

// --- Public Routes ---
app.get('/', (req, res) => {
    res.send('<h1>Home Page</h1><a href="/auth/google">Log In with Google</a>');
});

// --- Authentication Routes ---
// The route that starts the Google authentication process.
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// The callback route that Google redirects to after authentication.
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to a protected route.
    res.redirect('/profile');
  }
);

// --- Protected Route ---
// This route is only accessible to logged-in users.
app.get('/profile', isAuthenticated, (req, res) => {
    // req.user is populated by Passport with the user's information.
    res.send(`<h1>Welcome, ${req.user.displayName}</h1><p>Your email is ${req.user.emails[0].value}</p><a href="/logout">Logout</a>`);
});

// --- Logout Route ---
app.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});


// 7. START THE SERVER
// =============================================================================
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});