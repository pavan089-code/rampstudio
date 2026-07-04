import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
const metrics=new Set(["views","uniqueVisitors","galleryViews","rsvpCount","shareCount","livestreamOpens","photoDownloads"]);
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){try{const{id}=await params;const{metric,source}=await request.json() as{metric?:string;source?:string};if(!metric||!metrics.has(metric))return NextResponse.json({error:"Invalid metric"},{status:400});const payload:Record<string,unknown>={[metric]:FieldValue.increment(1)};if(metric==="views"&&source)payload[`sources.${source.replace(/[^a-zA-Z0-9_-]/g,"_").slice(0,80)}`]=FieldValue.increment(1);await getAdminDb().doc(`eventAnalytics/${id}`).set(payload,{merge:true});return NextResponse.json({success:true});}catch{return NextResponse.json({error:"Analytics unavailable"},{status:503});}}
