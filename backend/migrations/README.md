# Database Migrations

This directory contains SQL migration files for the Tetris Cooperativo Asincrono database.

## Running Migrations

### Using Docker

If you're using Docker Compose, migrations will run automatically when the PostgreSQL container starts.

```bash
docker-compose up -d postgres
```

### Manually

To run migrations manually:

```bash
# Connect to PostgreSQL
psql -h localhost -U tetris -d tetris_coop

# Run the migration file
\i migrations/1699000000000_initial-schema.sql
```

### Using npm scripts

```bash
cd backend
npm run db:migrate
```

## Creating New Migrations

To create a new migration:

```bash
cd backend
npm run db:migrate:create <migration_name>
```

This will create a new timestamped SQL file in the migrations directory.

## Migration Naming Convention

Migrations follow the pattern: `<timestamp>_<description>.sql`

Example: `1699000000000_initial-schema.sql`

## Schema Overview

### Core Tables

- **users**: Player accounts
- **games**: Game sessions
- **game_players**: Players in each game (many-to-many)
- **game_states**: Current grid state for each game
- **moves**: Individual piece placements

### Supporting Tables

- **notifications**: Push notification history
- **analytics_events**: Research data collection
- **push_tokens**: Device tokens for push notifications

### Automatic Triggers

1. **update_game_lines_cleared**: Automatically updates total lines cleared when a move is inserted
2. **check_game_completion**: Automatically marks game as completed when target lines reached

## Indexes

Performance indexes are created on:
- Foreign keys
- Frequently queried fields (status, created_at)
- Composite indexes for common query patterns

## Constraints

- Email format validation
- Username length (min 3 characters)
- Player number (1-4)
- Piece types (I, O, T, S, Z, J, L)
- Rotation (0-3)
- Position bounds (x: 0-9, y: ≥0)

## Seeded Data

The initial migration includes a default admin user:
- Username: `admin`
- Email: `admin@tetriscoop.com`
- Password: `admin123` (CHANGE IN PRODUCTION!)

## Rollback

To rollback the last migration:

```bash
npm run db:migrate:down
```

## Notes

- All tables use UUID primary keys
- Timestamps use PostgreSQL's NOW() function
- JSONB is used for flexible data storage (grid_state, event_data, notification_data)
- Cascade delete is enabled for dependent records
