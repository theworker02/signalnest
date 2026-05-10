import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { env } from "./env.js";

export async function hashPassword(password: string) {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}

export function issueAccessToken(userId: string, sessionId: string) {
  return jwt.sign({ sub: userId, sid: sessionId, typ: "access" }, env.JWT_ACCESS_SECRET, { expiresIn: "12m" });
}

export function issueRefreshToken(userId: string, sessionId: string, familyId: string) {
  return jwt.sign({ sub: userId, sid: sessionId, fid: familyId, typ: "refresh" }, env.JWT_REFRESH_SECRET, { expiresIn: "30d" });
}
