"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import catalogService from "@/services/catalog";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { Skill } from "@/types";

const DEBOUNCE_MS = 300;

export interface SkillTagInputProps {
  value: Skill[];
  onChange: (skills: Skill[]) => void;
  placeholder?: string;
  allowCreate?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SkillTagInput({
  value,
  onChange,
  placeholder = "Type to search skills…",
  allowCreate = true,
  disabled = false,
  className,
}: SkillTagInputProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const selectedIds = useMemo(() => new Set(value.map((skill) => skill.id)), [value]);

  const filteredSuggestions = useMemo(
    () => suggestions.filter((skill) => !selectedIds.has(skill.id)),
    [suggestions, selectedIds],
  );

  const trimmedQuery = query.trim();
  const showCreateOption =
    allowCreate &&
    trimmedQuery.length > 0 &&
    !filteredSuggestions.some(
      (skill) => skill.name.toLowerCase() === trimmedQuery.toLowerCase(),
    );

  const dropdownOptions = showCreateOption
    ? [...filteredSuggestions, { id: -1, name: trimmedQuery } as Skill]
    : filteredSuggestions;

  const fetchSuggestions = useCallback(
    async (term: string) => {
      if (!term) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const results = await catalogService.searchSkills(term);
        setSuggestions(results);
      } catch (err) {
        setError(getApiErrorMessage(err));
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      void fetchSuggestions(trimmedQuery);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [trimmedQuery, open, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addSkill = (skill: Skill) => {
    if (selectedIds.has(skill.id)) return;
    onChange([...value, skill]);
    setQuery("");
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const removeSkill = (skillId: number) => {
    onChange(value.filter((skill) => skill.id !== skillId));
  };

  const createAndAddSkill = async () => {
    if (!trimmedQuery) return;
    setLoading(true);
    setError(null);
    try {
      const skill = await catalogService.createSkill({ name: trimmedQuery });
      addSkill(skill);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const selectOption = async (option: Skill) => {
    if (option.id === -1) {
      await createAndAddSkill();
      return;
    }
    addSkill(option);
  };

  const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((prev) =>
        dropdownOptions.length ? (prev + 1) % dropdownOptions.length : -1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) =>
        dropdownOptions.length
          ? (prev - 1 + dropdownOptions.length) % dropdownOptions.length
          : -1,
      );
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && dropdownOptions[activeIndex]) {
        await selectOption(dropdownOptions[activeIndex]);
        return;
      }

      const exact = filteredSuggestions.find(
        (skill) => skill.name.toLowerCase() === trimmedQuery.toLowerCase(),
      );
      if (exact) {
        addSkill(exact);
        return;
      }

      if (showCreateOption) {
        await createAndAddSkill();
      }
    }

    if (event.key === "Backspace" && !query && value.length) {
      removeSkill(value[value.length - 1].id);
    }
  };

  return (
    <div ref={rootRef} className={cn("space-y-2", className)}>
      <div
        className={cn(
          "flex min-h-11 flex-wrap items-center gap-2 rounded-xl border border-default bg-surface-card px-3 py-2",
          disabled && "opacity-60",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((skill) => (
          <span
            key={skill.id}
            className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--brand-blue)_12%,var(--surface-muted))] px-2.5 py-1 text-sm font-medium text-heading"
          >
            {skill.name}
            {!disabled ? (
              <button
                type="button"
                className="rounded-full p-0.5 text-subtle hover:bg-surface-muted hover:text-heading"
                aria-label={`Remove ${skill.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  removeSkill(skill.id);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </span>
        ))}

        <Input
          ref={inputRef}
          id={listId}
          value={query}
          disabled={disabled}
          placeholder={value.length ? "Add another skill…" : placeholder}
          className="min-w-[160px] flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${listId}-listbox`}
          aria-autocomplete="list"
        />
      </div>

      {open && (trimmedQuery || loading || error) ? (
        <ul
          id={`${listId}-listbox`}
          role="listbox"
          className="max-h-56 overflow-y-auto rounded-xl border border-default bg-surface-card shadow-lg"
        >
          {loading ? (
            <li className="text-subtle px-3 py-2 text-sm">Searching…</li>
          ) : null}
          {error ? (
            <li className="px-3 py-2 text-sm text-[var(--brand-rose)]">{error}</li>
          ) : null}
          {!loading && !error && dropdownOptions.length === 0 ? (
            <li className="text-subtle px-3 py-2 text-sm">No matching skills</li>
          ) : null}
          {dropdownOptions.map((option, index) => {
            const isCreate = option.id === -1;
            return (
              <li key={isCreate ? `create-${option.name}` : option.id} role="option">
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-muted",
                    index === activeIndex && "bg-surface-muted",
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => void selectOption(option)}
                >
                  {isCreate ? (
                    <>
                      <Plus className="h-4 w-4 shrink-0 text-[var(--brand-blue)]" />
                      <span>
                        Add &apos;{option.name}&apos; as a new skill
                      </span>
                    </>
                  ) : (
                    option.name
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {value.length > 0 ? (
        <p className="text-subtle text-xs">
          {value.length} skill{value.length === 1 ? "" : "s"} selected
        </p>
      ) : null}
    </div>
  );
}
