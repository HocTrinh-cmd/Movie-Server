import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h'; 
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '30d';


export const generateAccessToken = (userId: string) => {
    if(!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
    
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRATION as any });
}

export const generateRefreshToken = (userId: string)=> {
    if(!REFRESH_TOKEN_SECRET) throw new Error("REFRESH_TOKEN_SECRET is not defined");
    
    return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION as any });
}

export const verifyAccessToken = (token: string) => {
    if(!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
    
    return jwt.verify(token, JWT_SECRET);  
}

export const verifyRefreshToken = (token: string) => {
    if(!REFRESH_TOKEN_SECRET) throw new Error("REFRESH_TOKEN_SECRET is not defined");
    
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
}