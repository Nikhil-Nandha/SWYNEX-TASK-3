# StudySprint — Student Study Planner

A mobile-responsive student productivity app built with **HTML5, CSS3 and vanilla JavaScript**. No framework, package installation or build step is required.

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser, or run `python -m http.server 8000` in this folder and visit `http://localhost:8000`.

## Primary screens

- **Welcome / Profile:** demo profile form with name and email validation.
- **Dashboard:** live counts, today's tasks and subject completion overview.
- **My Subjects:** add subjects with duplicate and length validation.
- **Task Manager:** create, list, filter, complete and delete tasks.
- **Progress Tracker:** completion rate and dynamically calculated progress by subject.

## Core feature path: create and manage a task

1. Add a subject if the desired subject is not listed.
2. Choose **Add a task**, enter a title, subject and due date, then save.
3. The new task appears in Task Manager and (when due today) on the dashboard.
4. Mark it complete or pending; the dashboard and progress tracker update immediately.
5. Delete tasks with the × action and confirmation prompt.

## Validation and states

- Task title is required and must contain 3–80 characters.
- A valid existing subject and a due date of today or later are required.
- Subject names must contain 2–40 characters and cannot be duplicates (case-insensitive).
- Profile requires a name and valid email format.
- Empty states are provided for task filters, today's tasks, subjects and progress.
- User-created tasks, subjects and profile details persist in browser `localStorage` across refreshes on the same browser/device.

## Data and privacy

This is a front-end demo. It does not use a server or cloud database. Data stays in the browser's local storage; clearing browser site data removes it. The profile form is not real authentication. Seeded sample data is provided on first launch.
