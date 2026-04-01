# STEMScore

QR code-based scoring for STEM competitions. Judges scan a QR code, enter their name, and start scoring in under 10 seconds. No accounts, no app downloads, no training.

Built for science fairs, robotics competitions, and hackathons.

---

## How It Works

```
Admin creates event → Prints QR code → Judges scan & score → Leaderboard updates live
```

1. **Admin** logs in, creates an event, and adds participants (individually, as teams, or via CSV import)
2. **Admin** prints or shares the QR code for the event
3. **Judges** scan the QR code on their phone, enter their name, review the scoring rubric, and start scoring
4. **Scores** appear on the live leaderboard in real-time with ribbon assignments
5. **Participants** get shareable score cards with radar charts and judge feedback

## Features

- **Zero-friction judge onboarding** - scan QR, enter name, score. No accounts needed
- **4 scoring categories** - Creativity, Thoroughness, Clarity, Student Independence (1-5 scale)
- **Traffic light score buttons** - red (1-2), amber (3), green (4-5) for intuitive scoring
- **Scoring rubric** - judges acknowledge the rubric before scoring (Advanced / Competent / Developing)
- **Individual & team support** - teams of up to 4 members with auto-naming
- **CSV import** - bulk import participants from spreadsheets (supports quoted fields, auto-detects teams)
- **Live leaderboard** - real-time score updates with reveal mode animation
- **Ribbon assignments** - Outstanding (16-20), Achievement (9-15), Participation (1-8)
- **Shareable score cards** - radar charts, category breakdowns, judge feedback quotes, OG images
- **Edit everything** - inline edit for all participant details after import
- **PWA** - installable on mobile, works offline
- **Animated UI** - framer-motion, React Bits (ShinyText, SplitText, BlurFade, Magnet, SpotlightCard)
- **106 tests** - 26 unit (Vitest) + 80 E2E (Playwright)

## Tech Stack

- **Next.js 14+** (App Router, Server Components, Server Actions)
- **shadcn/ui** (Card, Button, Input, Sheet, Dialog, Badge, Sonner)
- **Firebase** (Firestore + Auth, local Emulator Suite for dev)
- **Tailwind CSS 4**
- **TypeScript**
- **Zod** (schema validation)
- **Recharts** (radar charts, bar charts)
- **react-qr-code** (QR code generation)
- **framer-motion** (animations)
- **Playwright** (E2E tests)
- **Vitest** (unit tests)

## Getting Started

### Prerequisites

- Node.js 20+
- Java 11+ (for Firebase Emulator)
- Firebase CLI (`npm install -g firebase-tools`)

### Setup

```bash
# Clone and install
git clone <repo-url>
cd stem-score
npm install

# Start Firebase Emulator
firebase emulators:start

# Seed test data (in another terminal)
npx tsx scripts/seed.ts

# Start dev server
npm run dev
```

### Local URLs

| | |
|---|---|
| **App** | http://localhost:3000 |
| **Judge URL** | http://localhost:3000/score/fair2026 |
| **Emulator UI** | http://localhost:4000 |

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_USE_EMULATOR=true
ADMIN_PASSWORD=your-secure-password
```

## CSV Import Format

Supports two formats:

**STEM Fair format** (comma-separated with quoted team names):

```csv
Email,Power Needed,Location,Table,ParticipantNames,TeamCount,Grade(s),Teacher(s),Project Name,Project Category
parent@email.com,-,1,1,Ali Shoaib,1,K,Ms Smith,Volcano,Science
parent@email.com,-,4,1,"Aadhi, Ahir",2,K,Ms Sicard,Lava lamp,Science
```

**Simple format:**

```csv
Name, Project Title, Grade
Sarah Chen, Volcano Simulation, 6th
```

Teams are auto-detected when `TeamCount > 1` or names contain commas. Teams without a project name get auto-named `Team#Location`.

## Scoring Rubric

| Criteria | Advanced (4-5) | Competent (3) | Developing (1-2) |
|----------|---------------|---------------|-------------------|
| **Creativity** | New concept beyond grade level | Concept at grade level | Concept below grade level |
| **Thoroughness** | Thorough explanation | Some explanation | Very little explanation |
| **Clarity** | Visually appealing, clear demo | Clear presentation | Basic/unclear presentation |
| **Student Independence** | Understands concepts, answers questions | Some understanding | Cannot answer questions |

**Ribbon Awards:**
- **Outstanding** (16-20 points)
- **Achievement** (9-15 points)
- **Participation** (1-8 points)

## Running Tests

```bash
# Unit tests
npx vitest run

# E2E tests (requires dev server + emulators running)
npx playwright test

# E2E in headed mode (visible browser)
npx playwright test --headed

# Specific test file
npx playwright test e2e/csv-import.spec.ts
```

## Project Structure

```
stem-score/
├── src/
│   ├── app/
│   │   ├── page.tsx                          # Landing page
│   │   ├── admin/login/                      # Admin login
│   │   ├── (admin-auth)/admin/               # Auth-gated admin routes
│   │   │   ├── dashboard/                    # Event list
│   │   │   └── event/[id]/                   # Event management + QR sheet
│   │   ├── score/[token]/                    # Judge scoring flow
│   │   ├── event/[id]/leaderboard/           # Live leaderboard
│   │   └── card/[eventId]/[participantId]/   # Score cards + OG images
│   ├── components/
│   │   ├── app-header.tsx                    # Mobile app header
│   │   ├── score-input.tsx                   # 1-5 traffic light buttons
│   │   ├── score-form.tsx                    # Bottom sheet score form
│   │   ├── participant-card.tsx              # Participant list item
│   │   ├── rubric-modal.tsx                  # Judge rubric acknowledgment
│   │   ├── edit-participant-dialog.tsx        # Edit participant dialog
│   │   └── reactbits/                        # React Bits animations
│   ├── lib/
│   │   ├── firebase.ts                       # Client SDK
│   │   ├── firebase-admin.ts                 # Admin SDK
│   │   ├── schemas.ts                        # Zod schemas + rubric + ribbons
│   │   ├── aggregate.ts                      # Score aggregation
│   │   └── actions/                          # Server Actions
│   └── hooks/                                # React hooks
├── scripts/seed.ts                           # Emulator seed data
├── e2e/                                      # Playwright E2E tests
├── __tests__/                                # Vitest unit tests
└── public/                                   # PWA manifest + icons
```

## License

MIT
