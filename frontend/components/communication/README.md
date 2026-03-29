# Communication Components

Reusable communication UI for messaging, notifications, comments, reviews, mentions, contact forms, and activity streams.

## Included Components

- `ChatInterface`: prop-driven messaging shell built on the existing messaging primitives.
- `NotificationCenter`: dropdown notification inbox powered by the Zustand notification store.
- `CommentSection`: threaded comments with inline replies.
- `ReviewCard`: communication-folder export of the existing review card.
- `ContactForm`: validated contact form using `react-hook-form` and `zod`.
- `UserMentions`: textarea with `@mention` suggestions and keyboard navigation.
- `ActivityFeed`: unified stream for communication events.

## Notes

- Messaging and notifications reuse the existing real-time plumbing already present in the app.
- Inputs accept emoji naturally through standard text input behavior.
- Components are responsive and intended for use in app pages or Storybook stories.
