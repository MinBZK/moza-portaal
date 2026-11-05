"use client";

import {
  useId,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Button, Icon, TextInput } from "@/components/rhc";
import FieldLabel from "@/components/FieldLabel";
import { DigitalAssistantIcon } from "@/components/icons/digitalAssistantIcon";

type Option = {
  kind: "page" | "query" | "assistant";
  text: string;
};

const MAX_SUGGESTIONS = 8;

const matches = (text: string, typed: string) =>
  text.toLowerCase().includes(typed.trim().toLowerCase());

/** Bold for the part the user did not type yet (Baymard). */
const Predictive = ({ text, typed }: { text: string; typed: string }) => {
  const start = text.toLowerCase().indexOf(typed.trim().toLowerCase());
  if (!typed.trim() || start < 0) return <>{text}</>;
  const end = start + typed.trim().length;
  return (
    <>
      {start > 0 && <strong>{text.slice(0, start)}</strong>}
      {text.slice(start, end)}
      {end < text.length && <strong>{text.slice(end)}</strong>}
    </>
  );
};

/**
 * One field to search the whole portal or ask a question, with suggestions
 * for the current page first. Follows the WAI-ARIA combobox pattern.
 */
const SiteSearch = ({
  label = "Zoeken of een vraag stellen",
  action = "/zoeken",
  assistantHref = "/digitale-assistent",
  suggestions = [],
  pageSuggestions = [],
  defaultValue = "",
  onSearch,
}: {
  label?: string;
  /** Page with the search results; gets the query as ?q=. */
  action?: string;
  /** Opens the digital assistant with the question as ?vraag=. */
  assistantHref?: string;
  /** Search suggestions for the whole portal. */
  suggestions?: string[];
  /** Questions about the page the user is on; shown first. */
  pageSuggestions?: string[];
  /** Text in the field on load, such as the query on the results page. */
  defaultValue?: string;
  /** Instead of going to the results page, for example in a demo. */
  onSearch?: (query: string) => void;
}) => {
  const router = useRouter();
  const id = useId();
  const inputId = `${id}-input`;
  const listId = `${id}-list`;
  const [typed, setTyped] = useState(defaultValue);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const page = pageSuggestions
    .filter((text) => matches(text, typed))
    .slice(0, MAX_SUGGESTIONS);
  const query = typed.trim()
    ? suggestions
        .filter((text) => matches(text, typed) && !page.includes(text))
        .slice(0, MAX_SUGGESTIONS - page.length)
    : [];
  const options: Option[] = [
    ...page.map((text) => ({ kind: "page" as const, text })),
    ...query.map((text) => ({ kind: "query" as const, text })),
    ...(typed.trim()
      ? [{ kind: "assistant" as const, text: typed.trim() }]
      : []),
  ];
  const expanded = open && options.length > 0;
  const optionId = (index: number) => `${id}-option-${index}`;

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const search = (text: string) => {
    const q = text.trim();
    if (!q) return;
    close();
    if (onSearch) onSearch(q);
    else router.push(`${action}?q=${encodeURIComponent(q)}`);
  };

  const choose = (option: Option) => {
    if (option.kind === "assistant") {
      close();
      router.push(`${assistantHref}?vraag=${encodeURIComponent(option.text)}`);
      return;
    }
    setValue(option.text);
    setTyped(option.text);
    search(option.text);
  };

  const move = (step: 1 | -1) => {
    if (!options.length) return;
    setOpen(true);
    const next = (active + step + options.length + 1) % (options.length + 1);
    // One step past the last option returns to what the user typed.
    const index = next === options.length ? -1 : next;
    setActive(index);
    const option = options[index];
    setValue(option && option.kind !== "assistant" ? option.text : typed);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Enter" && expanded && active >= 0) {
      event.preventDefault();
      choose(options[active]);
    } else if (event.key === "Escape") {
      if (expanded) {
        // Otherwise the browser also clears the search field.
        event.preventDefault();
        setValue(typed);
        close();
      } else {
        setValue("");
        setTyped("");
      }
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    search(value);
  };

  const renderOption = (option: Option, index: number): ReactNode => (
    <li
      key={`${option.kind}-${option.text}`}
      id={optionId(index)}
      role="option"
      aria-selected={index === active}
      className={`utrecht-listbox__option utrecht-listbox__option--html-li rhc-mox-site-search__option${
        index === active ? " utrecht-listbox__option--active" : ""
      }`}
      // Keeps the focus in the field, so the list does not close first.
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => choose(option)}
    >
      {option.kind === "page" && <Icon icon="vraagteken" />}
      {option.kind === "query" && <Icon icon="zoek" />}
      {option.kind === "assistant" && <DigitalAssistantIcon />}
      <span>
        {option.kind === "assistant" ? (
          <>Vraag het de digitale assistent: “{option.text}”</>
        ) : (
          <Predictive text={option.text} typed={typed} />
        )}
      </span>
    </li>
  );

  const groups: { label: string; kind: Option["kind"] }[] = [
    { label: "Over deze pagina", kind: "page" },
    { label: "Zoeken in het portaal", kind: "query" },
    { label: "Of stel uw vraag", kind: "assistant" },
  ];

  return (
    <search className="rhc-mox-site-search">
      <form action={action} method="get" onSubmit={onSubmit}>
        <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
        <div className="rhc-mox-site-search__field">
          <TextInput
            id={inputId}
            name="q"
            type="search"
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={expanded}
            aria-controls={listId}
            aria-activedescendant={
              expanded && active >= 0 ? optionId(active) : undefined
            }
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setTyped(event.target.value);
              setActive(-1);
              setOpen(true);
            }}
            onKeyDown={onKeyDown}
            onBlur={close}
          />
          <Button type="submit" appearance="primary-action-button">
            Zoeken
          </Button>
          <div
            id={listId}
            role="listbox"
            aria-label="Suggesties"
            className="utrecht-listbox rhc-mox-site-search__popup"
            hidden={!expanded}
          >
            {groups.map(({ label: groupLabel, kind }) => {
              const indexed = options
                .map((option, index) => ({ option, index }))
                .filter(({ option }) => option.kind === kind);
              if (!indexed.length) return null;
              const groupId = `${id}-${kind}`;
              return (
                <ul
                  key={kind}
                  role="group"
                  aria-labelledby={groupId}
                  className="utrecht-listbox__group"
                >
                  <li
                    id={groupId}
                    role="presentation"
                    className="utrecht-listbox__group-label"
                  >
                    {groupLabel}
                  </li>
                  {indexed.map(({ option, index }) =>
                    renderOption(option, index),
                  )}
                </ul>
              );
            })}
          </div>
        </div>
        <div role="status" className="rhc-visually-hidden">
          {expanded
            ? `${options.length} ${options.length === 1 ? "suggestie" : "suggesties"}. Kies met de pijltjestoetsen.`
            : ""}
        </div>
      </form>
    </search>
  );
};

export default SiteSearch;
