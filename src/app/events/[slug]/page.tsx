import type { Metadata } from "next";
import EventPageClient from "./EventPageClient";
import { getAdminDb } from "@/lib/firebase-admin";

async function getMetadataEvent(slug:string){try{const s=await getAdminDb().collection("events").where("slug","==",slug).where("status","==","published").limit(1).get();return s.docs[0]?.data();}catch{return null;}}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const{slug}=await params;const event=await getMetadataEvent(slug);if(!event)return{title:"Event Experience | Ramp Studio"};const title=event.seoTitle||event.title;const description=event.seoDescription||event.description;const image=event.openGraphImage||event.coverImage||event.heroImage;return{title,description,openGraph:{title,description,type:"website",images:image?[image]:[]},twitter:{card:"summary_large_image",title,description,images:image?[image]:[]}};}
export default async function EventPage({params}:{params:Promise<{slug:string}>}){const{slug}=await params;return <EventPageClient slug={slug}/>;}
