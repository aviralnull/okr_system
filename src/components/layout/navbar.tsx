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

import { useTheme } from "next-themes";
import Link from "next/link";
import { NAV_ITEMS } from "@/lib/routes";
import type { SafeUser } from "@/lib/auth";
import { globalSearch } from "@/actions/global-search.actions";
import { useEffect, useState, useRef } from "react";
import {
  Bell,
  Search,
  Sun,
  Moon,
  UserRound,
  Settings,
  Briefcase,
  CalendarDays,
  ShieldCheck,
  Building2,
  ChevronRight,
} from "lucide-react";
import { GlobalSearch } from "../search/global-search";
interface Props {
  user: SafeUser;
  orgName : string ;
  unreadCount: number;
}

export function Navbar({ user,orgName, unreadCount }: Props) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [showProfile, setShowProfile] = useState(false);

const [search, setSearch] = useState("");
const [showSearch, setShowSearch] = useState(false);
const [searching, setSearching] = useState(false);

const [results, setResults] = useState({
  employees: [],
  objectives: [],
  teams: [],
  departments: [],
});

const searchRequestRef = useRef(0);


const profileRef = useRef<HTMLDivElement>(null);
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


//  useEffect(() => {
//   const query = search.trim();

//   if (!query) {
//     setResults({
//       employees: [],
//       objectives: [],
//       teams: [],
//       departments: [],
//     });

//     setSearching(false);
//     setShowSearch(false);

//     return;
//   }

//   setShowSearch(true);
//   setSearching(true);

//   const requestId = ++searchRequestRef.current;

//   const timer = setTimeout(async () => {
//     try {
//       const data = await globalSearch(query);

//       // Ignore old request
//       if (requestId !== searchRequestRef.current) {
//         return;
//       }

//       setResults(data);
//     } catch (error) {
//       console.error("Global search failed:", error);

//       if (requestId === searchRequestRef.current) {
//         setResults({
//           employees: [],
//           objectives: [],
//           teams: [],
//           departments: [],
//         });
//       }
//     } finally {
//       if (requestId === searchRequestRef.current) {
//         setSearching(false);
//       }
//     }
//   }, 300);

//   return () => {
//     clearTimeout(timer);
//   };
// }, [search]);

  useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (
      profileRef.current &&
      !profileRef.current.contains(event.target as Node)
    ) {
      setShowProfile(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  const currentNav = NAV_ITEMS.find((n) =>
    n.href === "/dashboard"
      ? pathname === n.href
      : pathname.startsWith(n.href)
  );

 const pageTitle = orgName;

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

         <GlobalSearch />

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

      
     <div className="relative" ref={profileRef}>
  {/* Avatar button */}
  <button
    type="button"
    onClick={() => setShowProfile((prev) => !prev)}
    className="relative w-9 h-9 rounded-full overflow-hidden
      bg-primary/10 text-primary
      border border-border
      hover:ring-4 hover:ring-primary/10
      transition-all duration-200"
    aria-label="Open profile menu"
  >
    {user.avatar ? (
      <img
        src={user.avatar}
        alt={user.name ?? "User"}
        className="w-full h-full object-cover"
      />
    ) : (
      <span className="w-full h-full flex items-center justify-center text-xs font-bold">
        {user.name?.slice(0, 2).toUpperCase() ?? "U"}
      </span>
    )}
  </button>

  {showProfile && (
    <div
      className="
        absolute right-0 top-[calc(100%+10px)]
        w-[320px]
        rounded-2xl
        border border-border
        bg-card
        shadow-2xl
        overflow-hidden
        z-[100]
        animate-in fade-in zoom-in-95 slide-in-from-top-2
        duration-150
      "
    >

      {/* Small arrow */}
      <div
        className="
          absolute -top-1.5 right-4
          w-3 h-3
          rotate-45
          bg-card
          border-l border-t border-border
        "
      />

      {/* ─────────────────────────────
          PROFILE HEADER
      ───────────────────────────── */}
      <div className="relative px-5 pt-5 pb-4">

        {/* subtle background */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent pointer-events-none" />

        <div className="relative flex items-center gap-3.5">

          {/* Large Avatar */}
          <div
            className="
              w-14 h-14
              rounded-2xl
              overflow-hidden
              flex-shrink-0
              bg-primary/10
              text-primary
              ring-4 ring-primary/5
              border border-border
            "
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name ?? "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-base font-bold">
                {user.name?.slice(0, 2).toUpperCase() ?? "U"}
              </div>
            )}
          </div>

          {/* Name */}
          <div className="min-w-0 flex-1">

            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground truncate">
                {user.name}
              </h3>

              {/* online dot */}
              <span
                className="
                  w-2 h-2
                  rounded-full
                  bg-emerald-500
                  ring-2 ring-emerald-500/20
                  flex-shrink-0
                "
              />
            </div>

            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {user.email}
            </p>

            {/* Role badge */}
            <div className="mt-2">
              <span
                className="
                  inline-flex items-center gap-1.5
                  px-2 py-1
                  rounded-md
                  bg-primary/10
                  text-primary
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                "
              >
                <ShieldCheck size={11} />
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────
          USER DETAILS
      ───────────────────────────── */}
      <div className="px-4 pb-3">

        <div className="rounded-xl bg-muted/40 border border-border/60 overflow-hidden">

          {/* Designation */}
          {user.designation && (
            <div className="flex items-center gap-3 px-3.5 py-3">
              <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center">
                <Briefcase
                  size={14}
                  className="text-muted-foreground"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Designation
                </p>

                <p className="text-xs font-medium text-foreground truncate">
                  {user.designation}
                </p>
              </div>
            </div>
          )}

          {/* Employee ID */}
          {user.employeeId && (
            <>
              <div className="h-px bg-border/60" />

              <div className="flex items-center gap-3 px-3.5 py-3">
                <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center">
                  <UserRound
                    size={14}
                    className="text-muted-foreground"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Employee ID
                  </p>

                  <p className="text-xs font-medium text-foreground">
                    {user.employeeId}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Joined */}
          {user.joinedAt && (
            <>
              <div className="h-px bg-border/60" />

              <div className="flex items-center gap-3 px-3.5 py-3">
                <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center">
                  <CalendarDays
                    size={14}
                    className="text-muted-foreground"
                  />
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Joined
                  </p>

                  <p className="text-xs font-medium text-foreground">
                    {new Date(user.joinedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─────────────────────────────
          ACTIONS
      ───────────────────────────── */}
      <div className="border-t border-border p-2">

        <Link
          href="/settings?tab=profile"
          onClick={() => setShowProfile(false)}
          className="
            flex items-center gap-3
            px-3 py-2.5
            rounded-xl
            hover:bg-muted
            transition-colors
            group
          "
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <UserRound size={14} className="text-primary" />
          </div>

          <div className="flex-1">
            <p className="text-xs font-medium text-foreground">
              View profile
            </p>
            <p className="text-[10px] text-muted-foreground">
              Manage your personal information
            </p>
          </div>

          <ChevronRight
            size={14}
            className="
              text-muted-foreground
              group-hover:translate-x-0.5
              transition-transform
            "
          />
        </Link>

        <Link
          href="/settings"
          onClick={() => setShowProfile(false)}
          className="
            flex items-center gap-3
            px-3 py-2.5
            rounded-xl
            hover:bg-muted
            transition-colors
            group
          "
        >
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Settings
              size={14}
              className="text-muted-foreground"
            />
          </div>

          <div className="flex-1">
            <p className="text-xs font-medium text-foreground">
              Settings
            </p>
            <p className="text-[10px] text-muted-foreground">
              Preferences and account settings
            </p>
          </div>

          <ChevronRight
            size={14}
            className="
              text-muted-foreground
              group-hover:translate-x-0.5
              transition-transform
            "
          />
        </Link>
      </div>
    </div>
  )}
</div>
    </header>
  );
}