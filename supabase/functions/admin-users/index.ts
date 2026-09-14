import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
serve(async(req)=>{if(req.method==="OPTIONS")return new Response("ok",{headers:cors});try{
 const url=Deno.env.get("SUPABASE_URL")!,anon=Deno.env.get("SUPABASE_ANON_KEY")!,service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,auth=req.headers.get("Authorization")||"";
 if(!auth.startsWith("Bearer "))return json({error:"UNAUTHORIZED"},401);
 const callerClient=createClient(url,anon,{global:{headers:{Authorization:auth}}});const {data:{user},error:userErr}=await callerClient.auth.getUser();if(userErr||!user)return json({error:"UNAUTHORIZED"},401);
 const admin=createClient(url,service,{auth:{persistSession:false}});const {data:caller}=await admin.from("profiles").select("role,status").eq("id",user.id).single();if(caller?.role!=="admin"||caller?.status!=="active")return json({error:"FORBIDDEN"},403);
 const body=await req.json(),action=String(body.action||""),targetId=String(body.userId||"");
 if(action==="list"){const {data,error}=await admin.from("profiles").select("id,email,display_name,role,status,ai_enabled,ban_reason,created_at,last_seen_at").order("created_at",{ascending:false}).limit(100);if(error)throw error;return json({success:true,users:data});}
 if(!targetId)return json({error:"MISSING_USER_ID"},400);if(targetId===user.id&&(action==="ban"||action==="delete"))return json({error:"SELF_ACTION_BLOCKED"},400);
 if(action==="ban"){const reason=String(body.reason||"Bị quản trị viên khóa").slice(0,200);const {error}=await admin.from("profiles").update({status:"banned",ban_reason:reason,banned_at:new Date().toISOString()}).eq("id",targetId);if(error)throw error;const {error:authErr}=await admin.auth.admin.updateUserById(targetId,{ban_duration:"876000h"});if(authErr)throw authErr;}
 else if(action==="unban"){const {error}=await admin.from("profiles").update({status:"active",ban_reason:null,banned_at:null}).eq("id",targetId);if(error)throw error;const {error:authErr}=await admin.auth.admin.updateUserById(targetId,{ban_duration:"none"});if(authErr)throw authErr;}
 else if(action==="restrict_ai"||action==="allow_ai"){const {error}=await admin.from("profiles").update({ai_enabled:action==="allow_ai"}).eq("id",targetId);if(error)throw error;}
 else if(action==="delete"){const {error}=await admin.auth.admin.deleteUser(targetId);if(error)throw error;}else return json({error:"INVALID_ACTION"},400);
 return json({success:true,action,userId:targetId});}catch(e){console.error(e);return json({error:"ADMIN_OPERATION_FAILED"},500);}});
