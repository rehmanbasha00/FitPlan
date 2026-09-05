import { PutObjectCommand,S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
const bucket=process.env.S3_BUCKET;const region=process.env.S3_REGION||'auto';
const client=bucket&&process.env.S3_ACCESS_KEY_ID&&process.env.S3_SECRET_ACCESS_KEY?new S3Client({region,endpoint:process.env.S3_ENDPOINT,credentials:{accessKeyId:process.env.S3_ACCESS_KEY_ID,secretAccessKey:process.env.S3_SECRET_ACCESS_KEY}}):null;
export async function uploadObject(file:File){const ext=file.name.includes('.')?'.'+file.name.split('.').pop():'',key=`fitplan/${new Date().toISOString().slice(0,10)}/${randomUUID()}${ext}`;if(client&&bucket){await client.send(new PutObjectCommand({Bucket:bucket,Key:key,Body:Buffer.from(await file.arrayBuffer()),ContentType:file.type}));const base=process.env.S3_PUBLIC_BASE_URL||process.env.S3_ENDPOINT; if(!base)throw new Error('S3_PUBLIC_BASE_URL is required for public media URLs');return `${base.replace(/\/$/,'')}/${key}`;}return null;}
