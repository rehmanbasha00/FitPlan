import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'crypto';
import { prisma } from './prisma';
import { AuthUser } from '@/types';

export const SESSION_COOKIE_NAME = 'fitplan_session';
export function hashPassword(password: string) { const salt = randomBytes(16).toString('hex'); return { hash: scryptSync(password, salt, 64).toString('hex'), salt }; }
export function verifyPassword(password: string, hash: string, salt: string) { const candidate=scryptSync(password,salt,64), stored=Buffer.from(hash,'hex'); return candidate.length===stored.length && timingSafeEqual(candidate,stored); }
export function normalizePhone(phone:string){ return phone.replace(/[^\d+]/g,'').replace(/^00/,'+'); }
export function toPublicUser(user:any):AuthUser{return {id:user.id,name:user.name,email:user.email,phone:user.phone,avatarUrl:user.avatarUrl,username:user.username,bio:user.bio,location:user.location,website:user.website};}
export async function createSession(userId:string){ const id=randomUUID(); await prisma.session.create({data:{id,userId,expiresAt:new Date(Date.now()+7*86400000)}}); return id; }
export async function destroySession(id:string){ await prisma.session.deleteMany({where:{id}}); }
export async function getUserFromSession(sessionId:string|undefined){ if(!sessionId)return null; const s=await prisma.session.findUnique({where:{id:sessionId},include:{user:true}}); if(!s||s.expiresAt.getTime()<Date.now()){if(s)await prisma.session.delete({where:{id:s.id}});return null;} return s.user; }
export async function createUser(name:string,email:string,password:string,phone:string){const {hash,salt}=hashPassword(password); const cleanEmail=email.toLowerCase(); const usernameBase=cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g,'').slice(0,20)||`traveler${Date.now()}`; let username=usernameBase; let n=1; while(await prisma.user.findUnique({where:{username}})){username=`${usernameBase}${n++}`;} const userId=`user-${randomUUID()}`; const walletId=`wallet-${randomUUID()}`; const walletHandle=`fp_${randomUUID().replace(/-/g,'').slice(0,20)}`; const qrPayload=`fitplan://wallet/${walletHandle}`; return prisma.$transaction(async (tx)=>{ const user=await tx.user.create({data:{id:userId,name,email:cleanEmail,phone:normalizePhone(phone),avatarUrl:`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(cleanEmail)}`,username,bio:'',location:'',website:'',passwordHash:hash,passwordSalt:salt}}); await tx.walletAccount.create({data:{id:walletId,userId:user.id,walletHandle,qrPayload,currency:'INR'}}); return user; });}
