'use client';

import { useMemo, useState } from 'react';
import { AtSign } from 'lucide-react';

export interface MentionableUser {
  id: string;
  name: string;
  handle: string;
  role?: string;
}

interface UserMentionsProps {
  users: MentionableUser[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function UserMentions({
  users,
  value,
  onChange,
  placeholder = 'Type @ to mention a user',
}: UserMentionsProps) {
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const query = useMemo(() => {
    const match = value.match(/(^|\s)@([\w-]*)$/);
    return match ? match[2].toLowerCase() : null;
  }, [value]);

  const suggestions = useMemo(() => {
    if (query === null) {
      return [];
    }

    return users.filter(
      (user) =>
        user.handle.toLowerCase().includes(query) ||
        user.name.toLowerCase().includes(query),
    );
  }, [query, users]);

  const insertMention = (handle: string) => {
    onChange(value.replace(/(^|\s)@[\w-]*$/, `$1@${handle} `));
    setHighlightedIndex(0);
  };

  return (
    <div className="relative rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <label className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100/45">
        <AtSign className="h-3.5 w-3.5" />
        Mentions
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (suggestions.length === 0) {
            return;
          }

          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setHighlightedIndex((current) =>
              current === suggestions.length - 1 ? 0 : current + 1,
            );
          }

          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setHighlightedIndex((current) =>
              current === 0 ? suggestions.length - 1 : current - 1,
            );
          }

          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            insertMention(suggestions[highlightedIndex].handle);
          }
        }}
        rows={4}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-white outline-none transition placeholder:text-blue-100/30 focus:border-blue-400/60"
      />

      {suggestions.length > 0 && (
        <div className="absolute left-4 right-4 top-[calc(100%-0.25rem)] z-20 rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl">
          {suggestions.slice(0, 5).map((user, index) => (
            <button
              key={user.id}
              type="button"
              onClick={() => insertMention(user.handle)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                index === highlightedIndex
                  ? 'bg-blue-500 text-white'
                  : 'text-blue-100/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{user.name}</span>
              <span className="font-mono text-xs opacity-80">
                @{user.handle}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
