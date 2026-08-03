# UX Redesign: Premium Airbnb-Style Housing Listings

This document outlines the UX/UI redesign for the **UniSphere Housing Listings** interface. The new design shifts from basic textual tables to a **premium, image-first Airbnb-style catalog** tailored specifically for students relocating near Nepalese college hubs.

---

## 1. The Design Aesthetic & Tokens

* **Typography:** Bold, clean headers using **Outfit** font for modern styling; body details in readable **Inter** font.
* **Palette:** Sleek dark mode (Slate-950 background) with **Sagarmatha Cyan** (`#06b6d4`) highlights, contrasted with glassmorphic semi-transparent tags.
* **Badges:** Verified listings feature a glowing teal badge representing physical audit completion by the UniSphere field team.

---

## 2. Airbnb-Style Listing Card Layout

Each listing card is designed as a self-contained visual container:

```
+---------------------------------------------------------+
| [Image Carousel - Slide 1 of 5]    [♥ Heart Overlay]    |
|                                                         |
| [Teal verified Seal]              [Glassmorphic type tag] |
+---------------------------------------------------------+
| ★ 4.8 (12 Reviews)          • Single Flat               |
|                                                         |
| **Sunlit Room near Pulchowk Gate**                      |
|                                                         |
| 📍 Pulchowk, Lalitpur                                    |
| 🚶 200m from IOE Pulchowk Main Gate                     |
|                                                         |
| [WiFi] [24/7 Water] [Furnished]                         |
|                                                         |
| ------------------------------------------------------- |
| **NPR 7,500** / month          [View Details Button]    |
+---------------------------------------------------------+
```

### 2.1 Micro-Interactions
* **Image Hover:** Fades in left/right arrow icons to browse photos without clicking into details.
* **Heart Icon:** Micro-animation scales up on click to save the room to the student's wishlist.
* **Hover Card Effect:** Smooth scale up (`scale-102`) with a subtle cyan drop-shadow.

---

## 3. Search & Filter Experience

### 3.1 The Search Bar ("The Student Pill")
A central floating capsule split into three interactive segments:
1. **Target College:** Smart autocomplete search input (e.g. "Kathmandu University").
2. **Room Type:** Dropdown filter (Single Room, Shared Room, Private Flat, Hostel).
3. **Monthly Budget:** Slider to pick range (NPR 3,000 - NPR 25,000).

### 3.2 Advanced Filter Panel
A sliding side drawer containing filters for:
* **Distance Radius:** Within 500m, 1km, or 3km of the target college.
* **Amenities Checklist:** High-Speed WiFi, 24/7 Water, No Landlord Interference, Parking, Study Desk included.
* **Gender preference:** Co-ed, Boys Only, Girls Only.

---

## 4. Mobile vs. Desktop Wireframe Layouts

### 4.1 Mobile Version (Vertical Discovery Feed)
* **Screen Frame:** 100% viewport width single-column list.
* **Layout Structure:**
  * **Top Header:** Sticky capsule Search Pill.
  * **Quick Tags Carousel:** Horizontal scrolling filter buttons: `[ Verified Only ]`, `[ < 500m ]`, `[ Single Room ]`.
  * **Cards Grid:** Vertically stacked card deck.
  * **Floating Action Button:** `[ Map View ]` button showing a map pop-up of the listings.

### 4.2 Desktop Version (Split-View Workspace)
* **Screen Frame:** 100% viewport width split 55/45.
* **Left Panel (55% width - Scrollable Feed):**
  * Displays search summary (e.g., "42 Rooms found near Pulchowk Campus").
  * **2-Column Grid:** Houses the Airbnb-style cards.
* **Right Panel (45% width - Sticky Map View):**
  * Integrated **OpenStreetMap** window.
  * Displays circular markers labeled with prices (e.g., `7.5K`, `5K`).
  * Clicking a map marker centers and highlights the corresponding card in the left feed.
