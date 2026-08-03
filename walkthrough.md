# Verification Walkthrough: Building UniSphere Nepal

We have successfully bootstrapped and built the step-by-step codebase for **UniSphere Nepal** (Sahavas), spanning the containerized databases, Java Spring Boot REST backend, and the React + Vite frontend dashboard.

---

## 1. Summary of Changes Made

### 1.1 Local Infrastructure
* **Created:** `docker-compose.yml` to spin up PostgreSQL with PostGIS capabilities alongside Redis cache containers.

### 1.2 Java Spring Boot Backend (`/backend`)
* **Gradle setup:** Configured dependencies inside `build.gradle` (Spring Boot Web, Security, JPA, Redis, Validation, Jwts, and Lombok).
* **Properties config:** Set up database connections and JWT secret configurations in `application.yml`.
* **Database DDL:** Created `schema.sql` to initialize tables with index points.
* **JPA Model Entities:** Mapped tables into Java models (`User.java`, `StudentProfile.java`, `College.java`, `Listing.java`, `ListingImage.java`, `RoommatePreference.java`).
* **JWT Stateless Security:** Implemented stateless authentication (`SecurityConfig.java`, `JwtAuthenticationFilter.java`, `JwtTokenProvider.java`, `UserPrincipal.java`).
* **Logout Blacklist:** Configured `TokenBlacklistService.java` utilizing Redis `StringRedisTemplate` to invalidate active tokens on logout.
* **Gower's Matching Engine:** Coded the weighted Gower's similarity calculations (`MatchingEngine.java`, `MatchingService.java`) with dealbreaker filters.
* **Spatial Repository:** Integrated PostGIS `ST_DWithin` spatial distance checks inside `ListingRepository.java` for room listing queries.

### 1.3 React Frontend (`/frontend`)
* **Project scaffold:** Set up Tailwind configuration and custom Outfit/Inter font imports in `index.html`.
* **Session context:** Wrote Axios API instance (`api.ts`) and `AuthContext.tsx` to handle tokens, register, login, and logout.
* **App Routing:** Configured routes inside `App.tsx` matching redirects to login/signup.
* **Dashboard View:** Coded the student main page shell (`Dashboard.tsx`).
* **Quiz & Match Cards:** Built matching forms (`RoommateDiscovery.tsx`) calculating Gower matches and showing dealbreaker alerts.
* **Housing Feed:** Coded directories list (`RoomSearch.tsx`) displaying pricing, descriptions, and verified badges.

---

## 2. What Was Tested & Validated

* **Type Safety & Directory Verification:** Verified that all paths compile cleanly under Gradle configurations, and TypeScript interfaces match.
* **Syntax Checks:** Resolved typos (such as correcting `@GET` annotations to `@GetMapping` in the REST controller).
* **Fallback Validation:** Verified that React components cleanly fallback to mock datasets (e.g., Suman Thapa matches at 81.8% compatibility) if local database connections are offline.
* **Bug Fix (Quiz Interface):** Fixed an interface issue in `RoommateDiscovery.tsx` where 4 of the 9 compatibility questionnaire elements (Study habits, Food preference, Social level, and Noise tolerance) were missing select inputs. Added custom styled dropdowns to successfully pass the full 9-factor matching vector to the backend.
* **Bug Fix (State Type Pollution):** Fixed an issue in `Signup.tsx` where selecting `academicYear` updated the form state with a string instead of an integer, causing React state type discrepancies. Implemented integer parsing inside the `handleChange` form handler.
* **Lint Warning Cleanups:** Removed unused imports (such as `Shield` in `RoommateDiscovery.tsx`, `MapPin` in `RoomSearch.tsx`, and `CheckCircle` / `Settings` in `Dashboard.tsx`) to ensure clean compilation warnings under strict Vite/ESLint build checks.

---

## 3. Directory Layout Blueprint
```
Sahavas/
├── docker-compose.yml
├── backend/
│   ├── build.gradle
│   ├── settings.gradle
│   └── src/main/
│       ├── java/com/unisphere/
│       │   ├── config/SecurityConfig.java
│       │   ├── controller/AuthController.java
│       │   ├── dto/SignupRequest.java
│       │   ├── model/User.java
│       │   ├── repository/ListingRepository.java
│       │   └── service/MatchingEngine.java
│       └── resources/
│           ├── application.yml
│           └── schema.sql
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── App.tsx
        ├── context/AuthContext.tsx
        ├── pages/RoommateDiscovery.tsx
        └── services/api.ts
```
