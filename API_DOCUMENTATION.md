# A-Dbacks API Documentation

Complete API reference for the A-Dbacks baseball scouting application.

## Base URL

All endpoints are accessed through the nginx load balancer:
- **Development**: `http://localhost`
- **Production**: Update in `nginx/nginx.conf`

## Routing

Endpoints are routed through nginx to microservices:
- `/user/*` → User Service (port 3000)
- `/player/*` → Player Service (port 3001)
- `/token/*` → Token Service (port 3002)
- `/session/*` → Session Service (port 3003)
- `/turn/*` → Turn Service (port 3004)
- `/pitch/*` → Pitch Service (port 3005)

## Authentication

Most endpoints require authentication via JWT token stored in cookies.

1. **Create a token**: `POST /token/create`
2. **Login**: `POST /user/login` (includes token ID in request)
3. **Cookie**: After login, a `user_token` cookie is set automatically
4. **Subsequent requests**: Include the cookie automatically

---

## User Service

Base Path: `/user/`

### `GET /user/health`
Check service health.

**Response:**
```json
{
  "health": "ok"
}
```

---

### `POST /user/create`
Create a new user account.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `UserResponse`
```json
{
  "id": "uuid",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "token": null,
  "players": [],
  "created_at": "2025-11-18T12:00:00",
  "updated_at": "2025-11-18T12:00:00"
}
```

**Errors:**
- `400`: Email already exists
- `500`: Internal server error

---

### `POST /user/login`
Login user and set authentication cookie.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "token": "token-uuid-here"
}
```

**Note:** Token must be created first via `POST /token/create`

**Response:**
```json
{
  "detail": "User Logged in succesfully."
}
```

**Cookie Set:** `user_token` (JWT token, 30 days expiry)

**Errors:**
- `400`: Invalid email/password, token doesn't exist, or token not registered to user

---

### `GET /user/`
Get current user's profile information.

**Authentication:** Required (cookie)

**Response:** `UserResponse`
```json
{
  "id": "uuid",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "token": "token-id",
  "players": [
    {
      "id": "player-uuid",
      "first_name": "Player",
      "last_name": "Name",
      "position": "P",
      "player_class": "2025"
    }
  ],
  "created_at": "2025-11-18T12:00:00",
  "updated_at": "2025-11-18T12:00:00"
}
```

**Errors:**
- `400`: Not authenticated

---

### `POST /user/logout`
Logout user and clear authentication cookie.

**Authentication:** Required (cookie)

**Response:**
```json
{
  "message": "User logged out successfully."
}
```

**Errors:**
- `400`: No logged in user

---

## Token Service

Base Path: `/token/`

### `GET /token/health`
Check service health.

**Response:**
```json
{
  "health": "ok"
}
```

---

### `POST /token/create`
Create a new token for user authentication.

**Authentication:** Not required

**Response:** `TokenResponse`
```json
{
  "id": "token-uuid",
  "claimer": null,
  "created_at": "2025-11-18T12:00:00",
  "updated_at": "2025-11-18T12:00:00"
}
```

**Usage:** Token ID is used in login request. After login, token is claimed by the user.

---

## Player Service

Base Path: `/player/`

### `GET /player/health`
Check service health.

**Response:**
```json
{
  "health": "ok"
}
```

---

### `POST /player/create`
Create a new player with full details.

**Authentication:** Required (cookie)

**Request Body:**
```json
{
  "first_name": "Juan",
  "last_name": "Rodriguez",
  "position": "P",
  "date_of_birth": "2005-03-15",
  "height": "6'2\"",
  "weight": "195",
  "throw": "right",
  "bat": "right",
  "birth_city": "Santo Domingo",
  "agent": null,
  "related_ids": null,
  "notes": null
}
```

**Field Descriptions:**
- `date_of_birth`: ISO format (YYYY-MM-DD), must be in the past
- `throw`: `"left"`, `"right"`, or `"switch"`
- `bat`: `"left"`, `"right"`, or `"switch"`
- `position`: `"P"`, `"C"`, `"1B"`, `"2B"`, `"SS"`, `"3B"`, `"OF"`, etc.
- `related_ids`: Optional dictionary of related player IDs

**Response:** `PlayerResponse`
```json
{
  "id": "player-uuid",
  "first_name": "Juan",
  "last_name": "Rodriguez",
  "position": "P",
  "date_of_birth": "2005-03-15",
  "player_class": "2022",
  "height": "6'2\"",
  "weight": "195",
  "throw": "right",
  "bat": "right",
  "birth_city": "Santo Domingo",
  "agent": null,
  "related_ids": null,
  "notes": null,
  "scout_id": "user-uuid",
  "created_at": "2025-11-18T12:00:00",
  "updated_at": "2025-11-18T12:00:00"
}
```

**Note:** `player_class` is automatically calculated based on date of birth:
- Jan 1 - Aug 31: DOB year + 17
- Sep 1 - Dec 31: DOB year + 18

**Errors:**
- `400`: Date of birth in the future, validation error
- `400`: Not authenticated

---

### `POST /player/fast-create`
Create a player with minimal required fields only.

**Authentication:** Required (cookie)

**Request Body:**
```json
{
  "first_name": "Juan",
  "last_name": "Rodriguez",
  "position": "P",
  "date_of_birth": "2005-03-15"
}
```

**Response:** `PlayerResponse` (same as create)

**Use Case:** Quick player creation during live scouting sessions.

---

### `PATCH /player/update/{player_id}`
Update an existing player's information.

**Authentication:** Required (cookie)

**Path Parameters:**
- `player_id`: UUID of the player to update

**Request Body:** (All fields optional)
```json
{
  "first_name": "Juan",
  "last_name": "Rodriguez",
  "position": "P",
  "height": "6'3\"",
  "weight": "200",
  "throw": "right",
  "bat": "right",
  "birth_city": "Santo Domingo",
  "agent": "agent-id",
  "related_ids": {"related_player": "uuid"},
  "notes": "Updated notes"
}
```

**Response:** `PlayerResponse`

**Errors:**
- `400`: Player doesn't exist
- `400`: User doesn't own this player
- `400`: Not authenticated

**Note:** `player_class` cannot be updated (calculated from DOB).

---

## Session Service

Base Path: `/session/`

### `GET /session/health`
Check service health.

**Response:**
```json
{
  "health": "ok"
}
```

---

### `POST /session/create`
Create a new scouting session for a specific date.

**Authentication:** Required (cookie)

**Request Body:**
```json
{
  "session_date": "2025-11-18"
}
```

**Response:** `SessionResponse`
```json
{
  "id": "session-uuid",
  "scout_id": "user-uuid",
  "session_date": "2025-11-18",
  "is_active": true,
  "turns": [],
  "created_at": "2025-11-18T12:00:00",
  "updated_at": "2025-11-18T12:00:00"
}
```

**Errors:**
- `400`: Active session already exists for this date
- `400`: Not authenticated

---

### `GET /session/active`
Get the currently active session for the authenticated user.

**Authentication:** Required (cookie)

**Response:** `SessionResponse` or `null`
```json
{
  "id": "session-uuid",
  "scout_id": "user-uuid",
  "session_date": "2025-11-18",
  "is_active": true,
  "turns": [],
  "created_at": "2025-11-18T12:00:00",
  "updated_at": "2025-11-18T12:00:00"
}
```

**Returns:** `null` if no active session exists.

---

### `GET /session/date/{session_date}`
Get a session by specific date.

**Authentication:** Required (cookie)

**Path Parameters:**
- `session_date`: Date in ISO format (YYYY-MM-DD)

**Example:** `GET /session/date/2025-11-18`

**Response:** `SessionResponse`

**Errors:**
- `404`: Session not found for this date
- `400`: Not authenticated

---

### `POST /session/{session_id}/end`
End an active session.

**Authentication:** Required (cookie)

**Path Parameters:**
- `session_id`: UUID of the session to end

**Response:** `SessionResponse` (with `is_active: false`)

**Errors:**
- `404`: Session not found
- `400`: Not authenticated
- `400`: User doesn't own this session

---

## Turn Service

Base Path: `/turn/`

### `GET /turn/health`
Check service health.

**Response:**
```json
{
  "health": "ok"
}
```

---

### `POST /turn/create`
Create a new turn (at-bat) within a session.

**Authentication:** Required (cookie)

**Request Body:**
```json
{
  "session_id": "session-uuid",
  "batter_id": "player-uuid",
  "pitcher_id": "player-uuid",
  "start_time": "14:30:00"
}
```

**Field Descriptions:**
- `start_time`: Optional, ISO time format (HH:MM:SS). If not provided, uses current time.

**Response:** `TurnResponse`
```json
{
  "id": "turn-uuid",
  "session_id": "session-uuid",
  "batter_id": "player-uuid",
  "pitcher_id": "player-uuid",
  "start_time": "14:30:00",
  "end_time": null,
  "balls": 0,
  "strikes": 0,
  "outs": 0,
  "runs": 0,
  "is_complete": false,
  "outcome": null,
  "created_at": "2025-11-18T12:00:00"
}
```

**Errors:**
- `404`: Session not found
- `400`: Not authenticated
- `400`: User doesn't own the session

---

### `POST /turn/{turn_id}/mark`
Mark start or end time for a turn.

**Authentication:** Required (cookie)

**Path Parameters:**
- `turn_id`: UUID of the turn

**Request Body:**
```json
{
  "mark_time": "14:35:00"
}
```

**Behavior:**
- First call sets `start_time`
- Second call sets `end_time`

**Response:** `TurnResponse`

**Errors:**
- `404`: Turn not found
- `400`: Not authenticated
- `400`: User doesn't own the turn

---

### `PATCH /turn/{turn_id}/update`
Change the batter or pitcher for a turn.

**Authentication:** Required (cookie)

**Path Parameters:**
- `turn_id`: UUID of the turn

**Request Body:** (Both optional, at least one required)
```json
{
  "batter_id": "new-batter-uuid",
  "pitcher_id": "new-pitcher-uuid"
}
```

**Response:** `TurnResponse`

**Use Case:** Switch players mid-turn without erasing pitch data.

**Errors:**
- `404`: Turn not found
- `400`: Not authenticated
- `400`: User doesn't own the turn

---

### `POST /turn/{turn_id}/erase`
Erase all pitches from a turn and reset the count.

**Authentication:** Required (cookie)

**Path Parameters:**
- `turn_id`: UUID of the turn

**Response:** `TurnResponse` (with reset counts)

**Behavior:**
- Deletes all pitches associated with the turn
- Resets `balls` and `strikes` to 0
- Sets `is_complete` to `false`
- Clears `outcome`

**Errors:**
- `404`: Turn not found
- `400`: Not authenticated
- `400`: User doesn't own the turn

---

### `GET /turn/{turn_id}`
Get turn details including all pitches.

**Authentication:** Required (cookie)

**Path Parameters:**
- `turn_id`: UUID of the turn

**Response:** `TurnResponse`

**Note:** Response includes pitches array (from relationship).

**Errors:**
- `404`: Turn not found
- `400`: Not authenticated
- `400`: User doesn't own the turn

---

## Pitch Service

Base Path: `/pitch/`

### `GET /pitch/health`
Check service health.

**Response:**
```json
{
  "health": "ok"
}
```

---

### `POST /pitch/add`
Add a pitch to a turn.

**Authentication:** Required (cookie)

**Request Body:**
```json
{
  "turn_id": "turn-uuid",
  "pitch_type": "FB",
  "pitch_result": "ball",
  "release_speed": 92.5
}
```

**Field Descriptions:**
- `pitch_type`: Optional. One of `"FB"` (Fast Ball), `"CB"` (Curve Ball), `"CH"` (Change Up), `"SL"` (Slider)
- `pitch_result`: Required. One of:
  - `"ball"` - Ball
  - `"strike_call"` - Called strike
  - `"swing_miss"` - Swinging strike
  - `"foul"` - Foul ball
  - `"hit"` - Hit
  - `"out"` - Out
  - `"walk"` - Walk (outcome, not a pitch result)
  - `"hbp"` - Hit by pitch
- `release_speed`: Optional. Float between 0-120 (mph)

**Response:** `PitchResponse`
```json
{
  "id": "pitch-uuid",
  "turn_id": "turn-uuid",
  "pitch_number": 1,
  "pitch_type": "FB",
  "pitch_result": "ball",
  "release_speed": 92.5,
  "created_at": "2025-11-18T12:00:00"
}
```

**Automatic Behavior:**
- Pitch number is auto-incremented
- Turn count is automatically updated:
  - `ball` → increments `balls`
  - `strike_call`, `swing_miss` → increments `strikes`
  - `foul` → increments `strikes` only if `strikes < 2`
- Turn completion is checked:
  - 4 balls → `is_complete: true`, `outcome: "walk"`
  - 3 strikes → `is_complete: true`, `outcome: "strikeout"`
  - `hit` → `is_complete: true`, `outcome: "hit"`
  - `out` → `is_complete: true`, `outcome: "out"`
  - `hbp` → `is_complete: true`, `outcome: "hbp"`

**Errors:**
- `400`: Turn is already complete
- `404`: Turn not found
- `400`: Not authenticated
- `400`: User doesn't own the turn

---

### `GET /pitch/session/{session_id}/pitcher/{pitcher_id}/count`
Get total pitch count for a pitcher in a session.

**Authentication:** Required (cookie)

**Path Parameters:**
- `session_id`: UUID of the session
- `pitcher_id`: UUID of the pitcher

**Response:** `PitchCountResponse`
```json
{
  "pitcher_id": "pitcher-uuid",
  "total_pitches": 52
}
```

**Use Case:** Track pitcher workload during a session.

**Errors:**
- `404`: Session not found
- `400`: Not authenticated
- `400`: User doesn't own the session

---

## Count Logic

The system automatically calculates balls and strikes based on pitch results:

### Strikes
- `strike_call` → +1 strike
- `swing_miss` → +1 strike
- `foul` → +1 strike (only if strikes < 2)

### Balls
- `ball` → +1 ball

### Turn Completion
- **4 balls** → Walk (turn complete)
- **3 strikes** → Strikeout (turn complete)
- **hit** → Hit (turn complete)
- **out** → Out (turn complete)
- **hbp** → Hit by pitch (turn complete)

---

## Error Responses

All endpoints may return standard HTTP error codes:

### 400 Bad Request
```json
{
  "detail": "Error message describing what went wrong"
}
```

Common causes:
- Validation errors
- Business logic violations
- Authentication failures
- Resource ownership issues

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Example Workflow

### 1. Create User and Login
```bash
# Create token
POST /token/create
# Response: { "id": "token-123" }

# Create user
POST /user/create
{
  "first_name": "Scout",
  "last_name": "Manager",
  "email": "scout@dbacks.com",
  "password": "password123"
}

# Login
POST /user/login
{
  "email": "scout@dbacks.com",
  "password": "password123",
  "token": "token-123"
}
# Cookie: user_token is now set
```

### 2. Create Players
```bash
POST /player/create
{
  "first_name": "Juan",
  "last_name": "Rodriguez",
  "position": "P",
  "date_of_birth": "2005-03-15",
  "height": "6'2\"",
  "weight": "195",
  "throw": "right",
  "bat": "right",
  "birth_city": "Santo Domingo"
}
```

### 3. Create Session
```bash
POST /session/create
{
  "session_date": "2025-11-18"
}
# Response: { "id": "session-123", ... }
```

### 4. Create Turn
```bash
POST /turn/create
{
  "session_id": "session-123",
  "batter_id": "batter-123",
  "pitcher_id": "pitcher-123",
  "start_time": "14:30:00"
}
# Response: { "id": "turn-123", ... }
```

### 5. Mark Time
```bash
POST /turn/turn-123/mark
{
  "mark_time": "14:30:15"
}
```

### 6. Add Pitches
```bash
POST /pitch/add
{
  "turn_id": "turn-123",
  "pitch_type": "FB",
  "pitch_result": "ball",
  "release_speed": 92.5
}

POST /pitch/add
{
  "turn_id": "turn-123",
  "pitch_type": "CB",
  "pitch_result": "strike_call",
  "release_speed": 75.0
}
# Count automatically updates: 1-1
```

### 7. Check Turn Status
```bash
GET /turn/turn-123
# Response shows updated count and completion status
```

### 8. End Session
```bash
POST /session/session-123/end
```

---

## Notes

- All UUIDs are strings in UUID v4 format
- Dates are in ISO 8601 format (YYYY-MM-DD)
- Times are in ISO time format (HH:MM:SS)
- All timestamps are in ISO 8601 datetime format
- Authentication cookies are HttpOnly and expire after 30 days
- Player class year is automatically calculated and cannot be manually set
- Turn counts are automatically maintained by the pitch service
- Pitch numbers are auto-incremented per turn

