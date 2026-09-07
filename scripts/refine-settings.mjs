import { readFileSync, writeFileSync } from "node:fs";
const path = "src/components/admin/settings.tsx";
const old = readFileSync(path, "utf8");
const category = old.slice(old.indexOf("export function CategoryEditor"));
const header = old.slice(0, old.indexOf("const fields ="));
const component = `
const basic=[["designerName","Designer name"],["email","Email"],["availabilityText","Availability"],["longBio","About text"]] as const;
const socials=[["instagramUrl","Instagram"],["behanceUrl","Behance"],["linkedinUrl","LinkedIn"],["githubUrl","GitHub"]] as const;
const advanced=[["professionalTitle","Professional title"],["location","Location"],["shortBio","Short bio"],["aboutHeadline","About headline"],["contactHeadline","Contact headline"],["statement","Statement"],["statementAttribution","Statement attribution"],["bookingText","Booking text"],["openingEdition","Opening edition"],["defaultSeoTitle","Default SEO title"],["defaultSeoDescription","Default SEO description"]] as const;
const lists=[["capabilities","Capabilities"],["introDisciplines","Intro disciplines"],["workflowTools","Workflow tools"],["availableFor","Available for"]] as const;
export function SettingsEditor({settings,media}:{settings:SiteSettings;media:MediaAsset[]}){
const[message,setMessage]=useState("");const[pending,start]=useTransition();const router=useRouter();
return <form className="settings-form" onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);start(async()=>{const result=await saveSettings({...Object.fromEntries([...basic,...socials,...advanced].map(([key])=>[key,String(data.get(key)??"")])),...Object.fromEntries(lists.map(([key])=>[key,String(data.get(key)??"").split(",").map(s=>s.trim()).filter(Boolean)])),socialImageId:data.get("socialImageId")||null});setMessage(result.ok?"Settings saved.":result.error);if(result.ok)router.refresh()})}}>
<fieldset disabled={pending} className="plain-fieldset"><section className="form-section"><span className="fs-label eyebrow">Profile</span><div className="form-row">{basic.slice(0,2).map(([key,label])=><Field key={key} name={key} label={label} value={settings[key]}/>)}</div>{basic.slice(2).map(([key,label])=><Field key={key} name={key} label={label} value={settings[key]} multiline={key==="longBio"}/>)}</section>
<section className="form-section"><span className="fs-label eyebrow">Social links</span>{socials.map(([key,label])=><Field key={key} name={key} label={label} value={settings[key]}/>)}</section>
<details><summary>Public content / Search metadata</summary>{advanced.map(([key,label])=><Field key={key} name={key} label={label} value={settings[key]} multiline={["shortBio","aboutHeadline","contactHeadline","statement","defaultSeoDescription"].includes(key)}/>)}{lists.map(([key,label])=><Field key={key} name={key} label={label+" (comma separated)"} value={settings[key].join(", ")}/>)}<div className="field"><label htmlFor="social-image">Default social image</label><select id="social-image" name="socialImageId" defaultValue={settings.socialImageId??""}><option value="">None</option>{media.map(m=><option key={m.id} value={m.id}>{m.fileName}</option>)}</select></div></details></fieldset>
{message&&<p role="status" className="notice">{message}</p>}<div className="save-bar" style={{justifyContent:"flex-end"}}><button disabled={pending} className="btn primary">Save settings</button></div></form>}
`;
writeFileSync(path, header + component + category);
