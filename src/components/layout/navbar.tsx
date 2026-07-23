// // components/layout/navbar.tsx
// "use client";

// import { usePathname } from "next/navigation";
// import { Bell, Search, Sun, Moon, Menu } from "lucide-react";
// import { useTheme } from "next-themes";
// import Link from "next/link";
// import { NAV_ITEMS } from "@/lib/routes";
// import type { SafeUser } from "@/lib/auth";
// import { useEffect , useState } from "react";
// interface Props {
//   user:        SafeUser;
//   unreadCount: number;
// }

// export function Navbar({ user, unreadCount }: Props) {
//   const pathname  = usePathname();
//   const { theme, setTheme } = useTheme();

//    const [mounted , setMounted] = useState(false) ;
//    const [currentDate , setCurrentDate] = useState("")
//    useEffect(()=>{
//     setMounted(true) 
//     setCurrentDate(
//         new Date().toLocaleDateString("en-IN" , {
//             weekday: "long",
//             day : "numeric",
//             month :"long",
//             year : "numeric" ,
//         })
//     ) ;
//    } , []) ;


   
//   // Get current page label from nav config
//   const currentNav = NAV_ITEMS.find((n) =>
//     n.href === "/dashboard" ? pathname === n.href : pathname.startsWith(n.href)
//   );
//   const pageTitle = currentNav?.label ?? "Dashboard";

//   return (
//     <header className="h-14 border-b border-border bg-card/60 backdrop-blur-sm fixed top-0 left-[220px] right-0 z-30 flex items-center px-5 gap-4">

//       {/* Page title */}
//       <div className="flex-1">
//         <h2 className="text-[20px] font-semibold text-foreground">{pageTitle}</h2>
//         <p className="text-[17px] text-muted-foreground hidden md:block">
//           {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
//         </p>
//       </div>

//       {/* Search */}
//       <div className="hidden md:flex items-center gap-2 bg-muted/60 border border-border rounded-lg px-3 py-1.5 w-52">
//         <Search size={13} className="text-muted-foreground flex-shrink-0" />
//         <input
//           placeholder="Search..."
//           className="bg-transparent text-[12px] outline-none placeholder:text-muted-foreground w-full"
//         />
//         <kbd className="text-[10px] bg-background border border-border rounded px-1 text-muted-foreground hidden lg:block">⌘K</kbd>
//       </div>

//       {/* Theme toggle */}
//       <button
//         onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
//         className="w-8 h-8 rounded-lg border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors"
//       >
//         {theme === "dark"
//           ? <Sun size={14} className="text-amber-400" />
//           : <Moon size={14} className="text-slate-500" />
//         }
//       </button>

//       {/* Notifications */}
//       <Link href="/notifications" className="relative w-8 h-8 rounded-lg border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors">
//         <Bell size={14} className="text-muted-foreground" />
//         {unreadCount > 0 && (
//           <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
//             {unreadCount > 9 ? "9+" : unreadCount}
//           </span>
//         )}
//       </Link>

//       {/* Avatar */}
//       <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[11px] font-semibold cursor-pointer">
//         {user.name.slice(0, 2).toUpperCase()}
//       </div>
//     </header>
//   );
// }

// components/layout/navbar.tsx
"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { NAV_ITEMS } from "@/lib/routes";
import type { SafeUser } from "@/lib/auth";
import { useEffect, useState } from "react";

interface Props {
  user: SafeUser;
  unreadCount: number;
}

export function Navbar({ user, unreadCount }: Props) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setMounted(true);

    setCurrentDate(
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  const currentNav = NAV_ITEMS.find((n) =>
    n.href === "/dashboard"
      ? pathname === n.href
      : pathname.startsWith(n.href)
  );

  const pageTitle = currentNav?.label ?? "Dashboard";

  return (
    <header className="h-14 border-b border-border bg-card/60 backdrop-blur-sm fixed top-0 left-[220px] right-0 z-30 flex items-center px-5 gap-4">
      {/* Page Title */}
      <div className="flex-1">
        <h2 className="text-[20px] font-semibold text-foreground">
          {pageTitle}
        </h2>

        <p className="text-[17px] text-muted-foreground hidden md:block">
          {currentDate}
        </p>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-muted/60 border border-border rounded-lg px-3 py-1.5 w-52">
        <Search
          size={13}
          className="text-muted-foreground flex-shrink-0"
        />

        <input
          placeholder="Search..."
          className="bg-transparent text-[12px] outline-none placeholder:text-muted-foreground w-full"
        />

        <kbd className="text-[10px] bg-background border border-border rounded px-1 text-muted-foreground hidden lg:block">
          ⌘K
        </kbd>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={() =>
          setTheme(theme === "dark" ? "light" : "dark")
        }
        className="w-8 h-8 rounded-lg border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors"
        aria-label="Toggle Theme"
      >
        {!mounted ? (
          <div className="w-[14px] h-[14px]" />
        ) : theme === "dark" ? (
          <Sun size={14} className="text-amber-400" />
        ) : (
          <Moon size={14} className="text-slate-500" />
        )}
      </button>

      {/* Notifications */}
      <Link
        href="/notifications"
        className="relative w-8 h-8 rounded-lg border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors"
      >
        <Bell size={14} className="text-muted-foreground" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>

      {/* User Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[11px] font-semibold cursor-pointer">
        {user.name?.slice(0, 2).toUpperCase() ?? "U"}
      </div>
    </header>
  );
}