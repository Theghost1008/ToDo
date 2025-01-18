import session from "express-session";
import connectMongo from "connect-mongo";
import dotenv from "dotenv";

dotenv.config();

const store = connectMongo.create({
    mongoUrl: `${process.env.MONGODB_URL}/ToDo?retryWrites=true&w=majority`,
    collectionName: 'sessions',
    ttl: 60 * 60 // 1 hour
});

store.on('error', (error) => {
    console.error('Session Store Error:', error);
});

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    store: connectMongo.create({ 
        mongoUrl: `${process.env.MONGODB_URL}/ToDo?retryWrites=true&w=majority`, 
        collectionName: 'sessions',
        ttl: 60 * 60 // 1 hour
    }),
    cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "None"
    }
});

export  {sessionMiddleware}
