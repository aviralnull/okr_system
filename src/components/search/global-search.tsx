"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Users,
  Users2,
  Building2,
  Target,
  ChevronRight,
} from "lucide-react";

import { globalSearch } from "@/actions/global-search.actions";

export type GlobalSearchResult = {
  employees: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    designation: string | null;
  }[];

  objectives: {
    id: string;
    title: string;
  }[];

  teams: {
    id: string;
    name: string;
  }[];

  departments: {
    id: string;
    name: string;
  }[];
};

const EMPTY_RESULTS: GlobalSearchResult = {
  employees: [],
  objectives: [],
  teams: [],
  departments: [],
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] =
    useState<GlobalSearchResult>(EMPTY_RESULTS);

  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  // Used to prevent old requests from overwriting newer results
  const requestId = useRef(0);

  const searchRef = useRef<HTMLDivElement>(null);

  // ─────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────

  useEffect(() => {
    const value = query.trim();

    if (!value) {
      setResults(EMPTY_RESULTS);
      setSearching(false);
      setOpen(false);
      return;
    }

    setOpen(true);
    setSearching(true);

    const currentRequest = ++requestId.current;

    const timer = setTimeout(async () => {
      try {
        const data = await globalSearch(value);

        // Ignore old request
        if (currentRequest !== requestId.current) {
          return;
        }

        setResults(data);
      } catch (error) {
        console.error("Global search error:", error);

        if (currentRequest === requestId.current) {
          setResults(EMPTY_RESULTS);
        }
      } finally {
        if (currentRequest === requestId.current) {
          setSearching(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  // ─────────────────────────────────────────────
  // Close when clicking outside
  // ─────────────────────────────────────────────

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ─────────────────────────────────────────────
  // Keyboard shortcut: Cmd/Ctrl + K
  // ─────────────────────────────────────────────

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();

        const input =
          searchRef.current?.querySelector("input");

        if (input instanceof HTMLInputElement) {
          input.focus();
        }

        setOpen(true);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyboard
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyboard
      );
    };
  }, []);

  // ─────────────────────────────────────────────
  // Clear search
  // ─────────────────────────────────────────────

  function clearSearch() {
    setQuery("");
    setResults(EMPTY_RESULTS);
    setSearching(false);
    setOpen(false);
  }

  // ─────────────────────────────────────────────
  // Result exists?
  // ─────────────────────────────────────────────

  const hasResults =
    results.employees.length > 0 ||
    results.objectives.length > 0 ||
    results.teams.length > 0 ||
    results.departments.length > 0;

  return (
    <div
      ref={searchRef}
      className="relative hidden md:block w-64"
    >
      {/* Search input */}

      <div
        className="
          flex items-center gap-2
          w-full
          px-3 py-1.5
          rounded-lg
          border border-border
          bg-muted/60
          transition-all
          focus-within:border-primary
          focus-within:ring-2
          focus-within:ring-primary/20
        "
      >
        <Search
          size={14}
          className="text-muted-foreground flex-shrink-0"
        />

        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(
              event.target.value.trim().length > 0
            );
          }}
          onFocus={() => {
            if (query.trim()) {
              setOpen(true);
            }
          }}
          placeholder="Search..."
          className="
            w-full
            bg-transparent
            text-[12px]
            text-foreground
            outline-none
            placeholder:text-muted-foreground
          "
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="
              flex-shrink-0
              text-muted-foreground
              hover:text-foreground
              transition-colors
            "
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        )}

        {!query && (
          <kbd
            className="
              hidden lg:block
              px-1.5
              py-0.5
              rounded
              border border-border
              bg-background
              text-[9px]
              text-muted-foreground
            "
          >
            ⌘K
          </kbd>
        )}
      </div>

      {/* Dropdown */}

      {open && (
        <div
          className="
            absolute
            top-[calc(100%+8px)]
            right-0
            w-[380px]
            max-h-[500px]
            overflow-y-auto
            rounded-xl
            border border-border
            bg-card
            shadow-2xl
            z-[100]
          "
        >
          {/* Searching */}

          {searching && (
            <div className="flex flex-col items-center justify-center py-8">
              <div
                className="
                  w-5 h-5
                  rounded-full
                  border-2
                  border-primary/30
                  border-t-primary
                  animate-spin
                  mb-3
                "
              />

              <p className="text-xs text-muted-foreground">
                Searching...
              </p>
            </div>
          )}

          {/* Results */}

          {!searching && hasResults && (
            <div className="py-2">
              {/* ─────────────────────────────
                  Employees
              ───────────────────────────── */}

              {results.employees.length > 0 && (
                <SearchSection
                  title="Employees"
                  icon={<Users size={12} />}
                >
                  {results.employees.map((employee) => (
                    <Link
                      key={employee.id}
                      href={`/employees/${employee.id}/activity`}
                      onClick={clearSearch}
                      className="
                        flex items-center gap-3
                        mx-2
                        px-2.5 py-2
                        rounded-lg
                        hover:bg-muted
                        transition-colors
                      "
                    >
                      {/* Avatar */}

                      <div
                        className="
                          w-8 h-8
                          rounded-full
                          bg-primary/10
                          text-primary
                          flex items-center justify-center
                          overflow-hidden
                          flex-shrink-0
                        "
                      >
                        {employee.avatar ? (
                          <img
                            src={employee.avatar}
                            alt={employee.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] font-bold">
                            {employee.name
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {employee.name}
                        </p>

                        <p className="text-[10px] text-muted-foreground truncate">
                          {employee.designation ||
                            employee.email}
                        </p>
                      </div>

                      <ChevronRight
                        size={13}
                        className="text-muted-foreground flex-shrink-0"
                      />
                    </Link>
                  ))}
                </SearchSection>
              )}

              {/* ─────────────────────────────
                  Objectives
              ───────────────────────────── */}

              {results.objectives.length > 0 && (
                <SearchSection
                  title="Objectives"
                  icon={<Target size={12} />}
                >
                  {results.objectives.map((objective) => (
                    <Link
                      key={objective.id}
                      href={`/objectives/${objective.id}`}
                      onClick={clearSearch}
                      className="
                        flex items-center gap-3
                        mx-2
                        px-2.5 py-2
                        rounded-lg
                        hover:bg-muted
                        transition-colors
                      "
                    >
                      <ResultIcon>
                        <Target
                          size={14}
                          className="text-primary"
                        />
                      </ResultIcon>

                      <p className="flex-1 text-xs font-medium truncate">
                        {objective.title}
                      </p>

                      <ChevronRight
                        size={13}
                        className="text-muted-foreground"
                      />
                    </Link>
                  ))}
                </SearchSection>
              )}

              {/* ─────────────────────────────
                  Teams
              ───────────────────────────── */}

              {results.teams.length > 0 && (
                <SearchSection
                  title="Teams"
                  icon={<Users2 size={12} />}
                >
                  {results.teams.map((team) => (
                    <Link
                      key={team.id}
                      href={`/teams/${team.id}`}
                      onClick={clearSearch}
                      className="
                        flex items-center gap-3
                        mx-2
                        px-2.5 py-2
                        rounded-lg
                        hover:bg-muted
                        transition-colors
                      "
                    >
                      <ResultIcon>
                        <Users2
                          size={14}
                          className="text-primary"
                        />
                      </ResultIcon>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {team.name}
                        </p>

                        <p className="text-[10px] text-muted-foreground">
                          Team
                        </p>
                      </div>

                      <ChevronRight
                        size={13}
                        className="text-muted-foreground"
                      />
                    </Link>
                  ))}
                </SearchSection>
              )}

              {/* ─────────────────────────────
                  Departments
              ───────────────────────────── */}

              {results.departments.length > 0 && (
                <SearchSection
                  title="Departments"
                  icon={<Building2 size={12} />}
                >
                  {results.departments.map(
                    (department) => (
                      <Link
                        key={department.id}
                        href={`/departments/${department.id}`}
                        onClick={clearSearch}
                        className="
                          flex items-center gap-3
                          mx-2
                          px-2.5 py-2
                          rounded-lg
                          hover:bg-muted
                          transition-colors
                        "
                      >
                        <ResultIcon>
                          <Building2
                            size={14}
                            className="text-primary"
                          />
                        </ResultIcon>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {department.name}
                          </p>

                          <p className="text-[10px] text-muted-foreground">
                            Department
                          </p>
                        </div>

                        <ChevronRight
                          size={13}
                          className="text-muted-foreground"
                        />
                      </Link>
                    )
                  )}
                </SearchSection>
              )}
            </div>
          )}

          {/* No results */}

          {!searching &&
            !hasResults &&
            query.trim() && (
              <div className="px-5 py-9 text-center">
                <div
                  className="
                    w-10 h-10
                    rounded-full
                    bg-muted
                    flex items-center justify-center
                    mx-auto
                    mb-3
                  "
                >
                  <Search
                    size={17}
                    className="text-muted-foreground"
                  />
                </div>

                <p className="text-xs font-semibold text-foreground">
                  No results found
                </p>

                <p className="text-[10px] text-muted-foreground mt-1">
                  Try a different employee, team,
                  department or objective.
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Search Section
// ─────────────────────────────────────────────

function SearchSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1">
      <div
        className="
          flex items-center gap-1.5
          px-4 py-2
          text-[10px]
          font-semibold
          uppercase
          tracking-wider
          text-muted-foreground
        "
      >
        {icon}
        <span>{title}</span>
      </div>

      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// Result Icon
// ─────────────────────────────────────────────

function ResultIcon({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        w-8 h-8
        rounded-lg
        bg-primary/10
        flex items-center justify-center
        flex-shrink-0
      "
    >
      {children}
    </div>
  );
}