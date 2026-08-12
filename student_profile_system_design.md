# System Design: Student Profile System (Nivaro / UniSphere Nepal)

This document presents the Product Design and Software Architecture for the **Student Profile System** of UniSphere Nepal. The system adopts a **LinkedIn + Bumble** hybrid philosophy: combining strict, verified academic credentials (from LinkedIn) with lifestyle compatibility, interests, and matching vectors (from Bumble) to solve roommate and housing search struggles.

---

## 1. Product & UX Design (LinkedIn + Bumble Hybrid)

### 1.1 The Hybrid Philosophy
* **LinkedIn (Professional Verification):** Strict verified student badges, academic major, semester, verified college enrollment, and career/study skills.
* **Bumble (Social & Lifestyle Match):** Visual card layouts, age, bio prompts, lifestyle interest tags (cooking, hiking, coding), languages spoken, budget ranges, and a dynamic **Compatibility Badge** (calculated in real time via Gower's similarity engine).

### 1.2 Profile Elements Core Schema
1. **Avatar/Profile Picture:** Premium circular image with a color-coded outer ring representing **Verification Status** (Teal = Verified Student, Amber = Pending, Grey = Unverified).
2. **Identity Details:** Full Name, Age, Gender.
3. **Academic Credentials:** College Name, Course/Major, Current Semester.
4. **Geography Details:** Home District (Origin), Current City, Preferred Relocation City.
5. **Lifestyle & Social Profile:** Short bio, Interests (hobbies), Skills, Languages spoken.
6. **Financial Details:** Monthly Rent Budget Range (Min-Max in NPR).
7. **Status Indicators:** 
   * **Profile Completion %:** Real-time completion progress meter.
   * **Verification Status:** `UNVERIFIED`, `PENDING_VERIFICATION`, `VERIFIED`.
   * **Student Badge:** Digital verified student card indicator.
   * **Compatibility Badge:** Interactive percentage match card indicator (e.g. `92% Match`).

---

## 2. Component Hierarchy (React Frontend)

The profile system utilizes atomic design, structured into reusable, typed React components:

```
[ProfileSystemRoot]
 ├── [ProfileProgressHeader] -> Progress bar (100% completion meter)
 ├── [ProfileWorkspaceLayout] -> Grid splitting main detail view & side widgets
 │    ├── [MainDetailPanel] -> Left Panel (LinkedIn style credentials)
 │    │    ├── [HeroSection] -> Cover banner, Avatar, Name, Verified Badges
 │    │    ├── [BioSection] -> Read-only or editable text area
 │    │    ├── [AcademicCard] -> College name, major, semester, verified seal
 │    │    ├── [TagsGrid] -> Groups of tags (Interests, Skills, Languages)
 │    │    │    └── [TagBadge] -> Individual clickable rounded tags
 │    │    └── [FinancesSection] -> Budget range details & relocation targets
 │    │
 │    └── [BumbleSwipeSidebar] -> Right Panel (Interactive Bumble-style match cards)
 │         ├── [MatchCardDeck] -> Stack of roommate cards
 │         │    ├── [MatchCard] -> Single card layout (large photo, overlay name/age)
 │         │    └── [CompatibilityBadge] -> Floating match % indicator
 │         └── [ActionControls] -> Chat, Save, Pass, Report triggers
```

---

## 3. Database Schema

We extend the database schema using relational mappings to accommodate array collections and profile verification metrics:

```sql
-- Enums for verification and gender
CREATE TYPE verification_state AS ENUM ('UNVERIFIED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED');
CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- 1. Table: student_profiles (Extended)
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS age INT CHECK (age BETWEEN 16 AND 40);
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS current_semester INT CHECK (current_semester BETWEEN 1 AND 8);
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS bio VARCHAR(500);
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS verification_status verification_state DEFAULT 'UNVERIFIED';
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS budget_min NUMERIC(10, 2);
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS budget_max NUMERIC(10, 2);
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS preferred_relocation_city VARCHAR(100);

-- 2. Table: student_interests (Many-to-Many join table pattern for tags)
CREATE TABLE IF NOT EXISTS student_interests (
    profile_id UUID REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    interest_tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (profile_id, interest_tag)
);

-- 3. Table: student_skills (Many-to-Many join table pattern)
CREATE TABLE IF NOT EXISTS student_skills (
    profile_id UUID REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    skill_tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (profile_id, skill_tag)
);

-- 4. Table: student_languages (Many-to-Many join table pattern)
CREATE TABLE IF NOT EXISTS student_languages (
    profile_id UUID REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    language_tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (profile_id, language_tag)
);

-- Indexing for match performance optimization
CREATE INDEX IF NOT EXISTS idx_profile_city_gender ON student_profiles(current_city, gender);
CREATE INDEX IF NOT EXISTS idx_interests_tag ON student_interests(interest_tag);
```

---

## 4. API Endpoints (Spring Boot Rest Controllers)

All endpoints accept JWT tokens in the `Authorization` header and enforce user-specific validation checks:

### 4.1 Profile Management
* **`GET /api/v1/profiles/me`**
  * *Description:* Fetch current authenticated user's profile, badges, and completion percentage.
  * *Response:* `200 OK`
    ```json
    {
      "fullName": "Prasanna Neupane",
      "age": 21,
      "gender": "MALE",
      "collegeName": "IOE Pulchowk Campus",
      "course": "Civil Engineering",
      "semester": 5,
      "homeDistrict": "Ghorahi, Dang",
      "currentCity": "Kathmandu",
      "preferredRelocationCity": "Lalitpur",
      "bio": "Avid structures enthusiast looking for a roommate in Lalitpur.",
      "interests": ["Chess", "Guitar", "Hiking"],
      "skills": ["Structural Design", "AutoCAD"],
      "languages": ["Nepali", "English", "Newari"],
      "budgetRange": { "min": 5000, "max": 8000 },
      "completenessPercentage": 95,
      "verificationStatus": "VERIFIED"
    }
    ```
* **`PUT /api/v1/profiles/me`**
  * *Description:* Update student profile details, hobbies, and relocation targets.
  * *Request Body:* Matches above JSON block.

### 4.2 Verification & Document Uploads
* **`POST /api/v1/profiles/me/verify`**
  * *Description:* Upload student ID card photos or request verification.
  * *Payload:* `MultipartFile documentImage`
  * *Response:* `202 Accepted`

---

## 5. UI Layout Specifications (Mobile & Desktop)

### 5.1 Mobile Layout (Bumble-First Focus)
* **Visual Frame:** Single column view optimized for quick swipe/discovery interactions.
* **Top Navigation:** Tab toggle: `[ Discover Roommates | My Profile ]`.
* **Discover View:** Card deck layout filling 75% of the viewport height. 
  * The card features a large rounded profile photo, with floating overlays at the bottom displaying Name, Age, verified badge icon, and the compatibility match score tag (`e.g., 94% Match` in green pills).
  * Swiping up reveals the detailed professional summary: academic semester, budget range, origin district, and interest badges.
* **Navigation Dock:** Floating bottom menu: `[ Home | Rooms Map | Inbox | Profile ]`.

### 5.2 Desktop Layout (LinkedIn-First Focus)
* **Visual Frame:** Dual-panel layout splitting screen space (65% credentials grid, 35% recommendation drawer).
* **Left Panel (Credentials Grid):**
  * **Header Card:** Large cover photo, profile avatar (offset overlap), Name, verified student badge, and academic credentials.
  * **Bio Card:** Standard clean read-only block.
  * **Attributes Grid:** Two columns detailing:
    * *Col 1 (Habits):* Budget ranges, Sleep schedules, Smoking tolerance.
    * *Col 2 (Socials):* Languages spoken, Origin district, Relocation target.
  * **Skills & Hobbies Card:** Grid displaying colored tag chips.
* **Right Panel (Recommendations Drawer):**
  * Side list showing roommate recommendations matching the current student.
  * Displays thumbnail, name, major, compatibility percentage, and a quick "Connect / Chat" button.
