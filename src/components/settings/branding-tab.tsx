// // src/components/settings/branding-tab.tsx
// "use client";

// import { useState, useTransition } from "react";
// import { Palette, Image, CheckCircle2, AlertCircle, Lock } from "lucide-react";
// import { updateBranding } from "@/actions/branding.actions";
// import { LockedBanner }   from "@/components/shared/primium-gate";
// import { canUseFeature }  from "@/lib/plan-config";
// import type { Plan }      from "@/lib/plan-config";

// function cn(...c: (string|false|undefined)[]) { return c.filter(Boolean).join(" "); }

// function Toast({ msg, type }: { msg: string; type: "success"|"error" }) {
//   return (
//     <div className={cn("fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium",
//       type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
//       {type === "success" ? <CheckCircle2 size={15}/> : <AlertCircle size={15}/>}
//       {msg}
//     </div>
//   );
// }

// export function BrandingTab({
//   plan, currentLogo, currentColor,
// }: {
//   plan:         Plan;
//   currentLogo?: string | null;
//   currentColor?: string;
// }) {
//   const [logo,         setLogo]    = useState(currentLogo ?? "");
//   const [color,        setColor]   = useState(currentColor ?? "#6366f1");
//   const [favicon,      setFavicon] = useState("");
//   const [toast, setToast]          = useState<{msg:string;type:"success"|"error"}|null>(null);
//   const [pending, start]           = useTransition();

//   const canUse = canUseFeature(plan, "customBranding");

//   const PRESET_COLORS = [
//     "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
//     "#f59e0b", "#10b981", "#06b6d4", "#3b82f6",
//     "#1e293b", "#334155",
//   ];

//   function showToast(msg: string, type: "success"|"error") {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3000);
//   }

//   function handleSave() {
//     const fd = new FormData();
//     fd.set("logo",         logo);
//     fd.set("primaryColor", color);
//     fd.set("favicon",      favicon);
//     start(async () => {
//       const res = await updateBranding(fd);
//       showToast(res.success ? res.message! : res.error, res.success ? "success" : "error");
//     });
//   }

//   if (!canUse) {
//     return (
//       <LockedBanner
//         requiredPlan="ENTERPRISE"
//         label="Custom Branding"
//         description="Add your logo, brand colors, and favicon to make OKR Desk feel like yours."
//       />
//     );
//   }

//   return (
//     <div className="space-y-5">

//       {/* Preview */}
//       <div className="rounded-xl border border-border bg-card overflow-hidden">
//         <div className="px-6 py-4 border-b border-border">
//           <p className="text-sm font-semibold text-foreground">Brand Preview</p>
//           <p className="text-xs text-muted-foreground mt-0.5">How your sidebar will look</p>
//         </div>
//         <div className="p-6">
//           <div className="w-48 rounded-xl overflow-hidden border border-border shadow-sm">
//             {/* Mini sidebar preview */}
//             <div className="p-3" style={{ background: "hsl(240 10% 6%)" }}>
//               <div className="flex items-center gap-2 mb-4">
//                 {logo ? (
//                   <img src={logo} alt="Logo" className="w-7 h-7 rounded-lg object-cover flex-shrink-0"/>
//                 ) : (
//                   <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
//                     style={{ background: color }}>
//                     <span className="text-white text-xs font-bold">O</span>
//                   </div>
//                 )}
//                 <span className="text-[hsl(0,0%,92%)] text-xs font-semibold">OKR Desk</span>
//               </div>
//               {["Dashboard", "Objectives", "Analytics"].map(item => (
//                 <div key={item} className="flex items-center gap-2 px-2 py-1.5 rounded-lg mb-1">
//                   <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: `${color}60` }}/>
//                   <span className="text-[10px]" style={{ color: "hsl(240 4% 65%)" }}>{item}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Logo */}
//       <div className="rounded-xl border border-border bg-card overflow-hidden">
//         <div className="px-6 py-4 border-b border-border">
//           <p className="text-sm font-semibold text-foreground">Logo</p>
//           <p className="text-xs text-muted-foreground mt-0.5">Shown in sidebar and emails</p>
//         </div>
//         <div className="p-6 space-y-3">
//           <div className="flex items-center gap-4">
//             <div className="w-14 h-14 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
//               {logo ? (
//                 <img src={logo} alt="Logo preview" className="w-full h-full object-cover"/>
//               ) : (
//                 <Image size={20} className="text-muted-foreground"/>
//               )}
//             </div>
//             <div className="flex-1">
//               <input value={logo} onChange={e => setLogo(e.target.value)}
//                 placeholder="https://yourcompany.com/logo.png"
//                 className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
//               <p className="text-[11px] text-muted-foreground mt-1">Paste a public image URL. Recommended: 64×64px PNG</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Brand color */}
//       <div className="rounded-xl border border-border bg-card overflow-hidden">
//         <div className="px-6 py-4 border-b border-border">
//           <p className="text-sm font-semibold text-foreground">Brand color</p>
//           <p className="text-xs text-muted-foreground mt-0.5">Used for buttons, active states, and accents</p>
//         </div>
//         <div className="p-6 space-y-4">
//           {/* Preset colors */}
//           <div>
//             <p className="text-xs font-medium text-muted-foreground mb-2">Preset colors</p>
//             <div className="flex gap-2 flex-wrap">
//               {PRESET_COLORS.map(c => (
//                 <button key={c} onClick={() => setColor(c)} type="button"
//                   className={cn("w-8 h-8 rounded-lg border-2 transition-all",
//                     color === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"
//                   )}
//                   style={{ background: c }} />
//               ))}
//             </div>
//           </div>

//           {/* Custom color */}
//           <div className="flex items-center gap-3">
//             <input type="color" value={color} onChange={e => setColor(e.target.value)}
//               className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent" />
//             <input value={color} onChange={e => setColor(e.target.value)}
//               placeholder="#6366f1" maxLength={7}
//               className="w-32 text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono" />
//             <div className="flex-1 h-10 rounded-lg" style={{ background: color }}/>
//           </div>
//         </div>
//       </div>

//       {/* Favicon */}
//       <div className="rounded-xl border border-border bg-card overflow-hidden">
//         <div className="px-6 py-4 border-b border-border">
//           <p className="text-sm font-semibold text-foreground">Favicon</p>
//           <p className="text-xs text-muted-foreground mt-0.5">Browser tab icon (16×16 or 32×32 ICO/PNG)</p>
//         </div>
//         <div className="p-6">
//           <input value={favicon} onChange={e => setFavicon(e.target.value)}
//             placeholder="https://yourcompany.com/favicon.ico"
//             className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
//         </div>
//       </div>

//       <div className="flex justify-end">
//         <button onClick={handleSave} disabled={pending}
//           className="text-sm px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
//           {pending && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
//           {pending ? "Saving..." : "Save branding"}
//         </button>
//       </div>

//       {toast && <Toast msg={toast.msg} type={toast.type}/>}
//     </div>
//   );
// }




// src/components/settings/branding-tab.tsx
"use client";

import { useState, useTransition } from "react";
import { Palette, Image, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { updateBranding } from "@/actions/branding.actions";
import { LockedBanner }   from "@/components/shared/primium-gate";
import { canUseFeature }  from "@/lib/plan-config";
import type { Plan }      from "@/lib/plan-config";

import { getCloudinarySignature } from "@/actions/cloudinary.actions";

function cn(...c: (string|false|undefined)[]) { return c.filter(Boolean).join(" "); }

function Toast({ msg, type }: { msg: string; type: "success"|"error" }) {
  return (
    <div className={cn("fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium",
      type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
      {type === "success" ? <CheckCircle2 size={15}/> : <AlertCircle size={15}/>}
      {msg}
    </div>
  );
}
  




export function BrandingTab({
  plan, currentLogo, currentColor, currentFavicon,
}: {
  plan:           Plan;
  currentLogo?:   string | null;
  currentColor?:  string;
  currentFavicon?: string;
}) {
  const [logo,         setLogo]    = useState(currentLogo ?? "");
  const [color,        setColor]   = useState(currentColor ?? "#6366f1");
  const [favicon,      setFavicon] = useState(currentFavicon ?? "");
  const [toast, setToast]          = useState<{msg:string;type:"success"|"error"}|null>(null);
  const [pending, start]           = useTransition();

const [logoPreview, setLogoPreview] = useState(currentLogo ?? "");
const [uploadingLogo, setUploadingLogo] = useState(false);

const [faviconPreview, setFaviconPreview] = useState("");

const [uploadingFavicon, setUploadingFavicon] =
  useState(false)

  const canUse = canUseFeature(plan, "customBranding");
 
  const PRESET_COLORS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
    "#f59e0b", "#10b981", "#06b6d4", "#3b82f6",
    "#1e293b", "#334155",
  ];

  

   async function uploadLogo(file: File) {
  if (!file) return;

  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    showToast("Only PNG, JPG and WEBP images are allowed", "error");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showToast("Logo must be smaller than 2MB", "error");
    return;
  }

  try {
    setUploadingLogo(true);

    // Get signed upload information from our server
   const auth = await getCloudinarySignature(
  "okr-desk/organization-logos"
);

    const formData = new FormData();

    formData.append("file", file);
    formData.append("api_key", auth.apiKey);
    formData.append("timestamp", String(auth.timestamp));
    formData.append("signature", auth.signature);
    formData.append("folder", auth.folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${auth.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok || !data.secure_url) {
      throw new Error(data.error?.message ?? "Logo upload failed");
    }

    setLogo(data.secure_url);
    setLogoPreview(data.secure_url);

    showToast("Logo uploaded successfully", "success");
  } catch (error) {
    console.error("Logo upload error:", error);

    showToast(
      error instanceof Error
        ? error.message
        : "Failed to upload logo",
      "error"
    );
  } finally {
    setUploadingLogo(false);
  }
}






async function uploadFavicon(file: File) {
  if (!file) return;

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/x-icon",
    "image/vnd.microsoft.icon",
  ];

  if (!allowedTypes.includes(file.type)) {
    showToast(
      "Only PNG, JPG, WEBP or ICO files are allowed",
      "error"
    );
    return;
  }

  if (file.size > 1 * 1024 * 1024) {
    showToast("Favicon must be smaller than 1MB", "error");
    return;
  }

  try {
    setUploadingFavicon(true);
   console.log("Starting favicon upload");
    const auth = await getCloudinarySignature(
      "okr-desk/favicons"
    );
    
console.log("Got Cloudinary auth");

    const formData = new FormData();

    formData.append("file", file);
    formData.append("api_key", auth.apiKey);
    formData.append("timestamp", String(auth.timestamp));
    formData.append("signature", auth.signature);
    formData.append("folder", auth.folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${auth.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok || !data.secure_url) {
      throw new Error(
        data.error?.message ?? "Favicon upload failed"
      );
    }

    setFavicon(data.secure_url);
    setFaviconPreview(data.secure_url);

    showToast(
      "Favicon uploaded successfully",
      "success"
    );
  } catch (error) {
    console.error("Favicon upload error:", error);

    showToast(
      error instanceof Error
        ? error.message
        : "Favicon upload failed",
      "error"
    );
  } finally {
    setUploadingFavicon(false);
  }
}


  function showToast(msg: string, type: "success"|"error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleSave() {
    // Validate hex color
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      showToast("Invalid color. Use hex like #6366f1", "error");
      return;
    }

  const fd = new FormData();

  fd.set("logo", logo);
  fd.set("primaryColor", color);
  fd.set("favicon", favicon);
    start(async () => {
      const res = await updateBranding(fd);
      if (res.success) {
        // ✅ Apply CSS variable live — no page reload needed
        applyBranding(color, logo, favicon);
        showToast(res.message ?? "Branding updated!", "success");
      } else {
        showToast(res.error, "error");
      }
    });
  }







  // Apply branding to document root immediately
  function applyBranding(primaryColor: string, logoUrl: string, faviconUrl: string) {
    // Convert hex to HSL for CSS variable
    const hsl = hexToHsl(primaryColor);
    document.documentElement.style.setProperty("--primary", hsl);
    document.documentElement.style.setProperty("--ring",    hsl);

    // Update favicon if provided
    if (faviconUrl) {
      const link = document.querySelector<HTMLLinkElement>("link[rel='icon']")
        ?? Object.assign(document.createElement("link"), { rel: "icon" });
      link.href = faviconUrl;
      document.head.appendChild(link);
    }
  }

  function hexToHsl(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  }

  if (!canUse) {
    return (
      <LockedBanner
        requiredPlan="ENTERPRISE"
        label="Custom Branding"
        description="Add your logo, brand colors, and favicon to make OKR Desk feel like yours."
      />
    );
  }

  return (
    <div className="space-y-5">

      {/* Preview */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Brand Preview</p>
          <p className="text-xs text-muted-foreground mt-0.5">How your sidebar will look</p>
        </div>
        <div className="p-6">
          <div className="w-48 rounded-xl overflow-hidden border border-border shadow-sm">
            {/* Mini sidebar preview */}
            <div className="p-3" style={{ background: "hsl(240 10% 6%)" }}>
              <div className="flex items-center gap-2 mb-4">
                {logo ? (
                  <img src={logo} alt="Logo" className="w-7 h-7 rounded-lg object-cover flex-shrink-0"/>
                ) : (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: color }}>
                    <span className="text-white text-xs font-bold">O</span>
                  </div>
                )}
                <span className="text-[hsl(0,0%,92%)] text-xs font-semibold">OKR Desk</span>
              </div>
              {["Dashboard", "Objectives", "Analytics"].map(item => (
                <div key={item} className="flex items-center gap-2 px-2 py-1.5 rounded-lg mb-1">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: `${color}60` }}/>
                  <span className="text-[10px]" style={{ color: "hsl(240 4% 65%)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Logo */}
      {/* <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Logo</p>
          <p className="text-xs text-muted-foreground mt-0.5">Shown in sidebar and emails</p>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
              {logo ? (
                <img src={logo} alt="Logo preview" className="w-full h-full object-cover"/>
              ) : (
                <Image size={20} className="text-muted-foreground"/>
              )}
            </div>
            <div className="flex-1">
              <input value={logo} onChange={e => setLogo(e.target.value)}
                placeholder="https://yourcompany.com/logo.png"
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              <p className="text-[11px] text-muted-foreground mt-1">Paste a public image URL. Recommended: 64×64px PNG</p>
            </div>
          </div>
        </div>
      </div> */}
      {/* Logo */}
<div className="rounded-xl border border-border bg-card overflow-hidden">
  <div className="px-6 py-4 border-b border-border">
    <p className="text-sm font-semibold text-foreground">
      Organization logo
    </p>

    <p className="text-xs text-muted-foreground mt-0.5">
      Shown in the sidebar and throughout your workspace
    </p>
  </div>

  <div className="p-6 space-y-4">

    {/* Preview */}
    <div className="flex items-center gap-4">

      <div className="w-20 h-20 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">

        {logoPreview ? (
          <img
            src={logoPreview}
            alt="Organization logo"
            className="w-full h-full object-cover"
          />
        ) : (
          <Image
            size={24}
            className="text-muted-foreground"
          />
        )}

      </div>

      <div className="flex-1 min-w-0">

        <p className="text-sm font-medium text-foreground">
          Workspace logo
        </p>

        <p className="text-xs text-muted-foreground mt-0.5">
          Recommended size: 128 × 128px
        </p>

        <div className="mt-3 flex items-center gap-2">

          {/* Computer upload */}
          <label
            className={cn(
              "inline-flex items-center gap-2 px-3 py-2 rounded-lg",
              "bg-primary text-primary-foreground",
              "text-xs font-medium cursor-pointer",
              "hover:opacity-90 transition-opacity",
              uploadingLogo && "opacity-50 pointer-events-none"
            )}
          >
            {uploadingLogo ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Image size={14} />
                Upload image
              </>
            )}

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              disabled={uploadingLogo}
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (!file) return;

                uploadLogo(file);

                // Allow selecting the same file again later
                e.currentTarget.value = "";
              }}
            />
          </label>

        </div>
      </div>
    </div>

    {/* Divider */}
    <div className="flex items-center gap-3">
      <div className="h-px bg-border flex-1" />

      <span className="text-[10px] text-muted-foreground">
        OR
      </span>

      <div className="h-px bg-border flex-1" />
    </div>

    {/* URL */}
    <div>
      <label className="text-xs font-medium text-foreground">
        Image URL
      </label>

      <input
        value={logo}
        onChange={(e) => {
          const value = e.target.value;

          setLogo(value);
          setLogoPreview(value);
        }}
        placeholder="https://example.com/logo.png"
        className="
          mt-1.5 w-full
          text-sm px-3 py-2.5
          rounded-lg
          border border-border
          bg-background
          outline-none
          focus:ring-2 focus:ring-primary/20
          focus:border-primary
          transition-all
        "
      />

      <p className="text-[11px] text-muted-foreground mt-1">
        Paste a public image URL
      </p>
    </div>

  </div>
</div>

      {/* Brand color */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Brand color</p>
          <p className="text-xs text-muted-foreground mt-0.5">Used for buttons, active states, and accents</p>
        </div>
        <div className="p-6 space-y-4">
          {/* Preset colors */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Preset colors</p>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} type="button"
                  className={cn("w-8 h-8 rounded-lg border-2 transition-all",
                    color === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                  )}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          {/* Custom color */}
          <div className="flex items-center gap-3">
            <input type="color" value={color} onChange={e => setColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent" />
            <input value={color} onChange={e => setColor(e.target.value)}
              placeholder="#6366f1" maxLength={7}
              className="w-32 text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono" />
            <div className="flex-1 h-10 rounded-lg" style={{ background: color }}/>
          </div>
        </div>
      </div>

      {/* Favicon */}
      {/* <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Favicon</p>
          <p className="text-xs text-muted-foreground mt-0.5">Browser tab icon (16×16 or 32×32 ICO/PNG)</p>
        </div>
        <div className="p-6">
          <input value={favicon} onChange={e => setFavicon(e.target.value)}
            placeholder="https://yourcompany.com/favicon.ico"
            className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
      </div> */}


      {/* Favicon */}
<div className="rounded-xl border border-border bg-card overflow-hidden">
  <div className="px-6 py-4 border-b border-border">
    <p className="text-sm font-semibold text-foreground">
      Favicon
    </p>

    <p className="text-xs text-muted-foreground mt-0.5">
      Browser tab icon. Recommended: 32×32 PNG or ICO.
    </p>
  </div>

  <div className="p-6 space-y-4">

    {/* Preview + Upload */}
    <div className="flex items-center gap-4">

      <div className="w-14 h-14 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden">
        {faviconPreview ? (
          <img
            src={faviconPreview}
            alt="Favicon preview"
            className="w-8 h-8 object-contain"
          />
        ) : (
          <Image
            size={20}
            className="text-muted-foreground"
          />
        )}
      </div>

      <div>
        <label
          className={cn(
            "inline-flex items-center gap-2",
            "px-3 py-2 rounded-lg",
            "bg-primary text-primary-foreground",
            "text-xs font-medium cursor-pointer",
            "hover:opacity-90 transition-opacity",
            uploadingFavicon &&
              "opacity-50 pointer-events-none"
          )}
        >
          {uploadingFavicon ? (
            <>
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Image size={14} />
              Upload favicon
            </>
          )}

          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.ico"
            className="hidden"
            disabled={uploadingFavicon}
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (!file) return;

              uploadFavicon(file);

              e.currentTarget.value = "";
            }}
          />
        </label>
      </div>
    </div>

    {/* URL */}
    <div>
      <div className="flex items-center gap-3">
        <div className="h-px bg-border flex-1" />
        <span className="text-[10px] text-muted-foreground">
          OR
        </span>
        <div className="h-px bg-border flex-1" />
      </div>

      <label className="block text-xs font-medium text-foreground mt-4">
        Favicon URL
      </label>

      <input
        value={favicon}
        onChange={(e) => {
          setFavicon(e.target.value);
          setFaviconPreview(e.target.value);
        }}
        placeholder="https://example.com/favicon.png"
        className="mt-1.5 w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
      />

      <p className="text-[11px] text-muted-foreground mt-1">
        Or paste a public favicon URL.
      </p>
    </div>

  </div>
</div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={pending}
          className="text-sm px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
          {pending && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
          {pending ? "Saving..." : "Save branding"}
        </button>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type}/>}
    </div>
  );
}
