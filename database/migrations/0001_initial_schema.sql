-- Nivaro Initial Database Schema Migration (PostgreSQL Compatible)
-- Cleaned schema matching Spring Boot JPA model layout

-- Enable PostGIS spatial extension (required for room location distance checks)
CREATE EXTENSION IF NOT EXISTS "postgis";
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- COMMON FUNCTIONS & TRIGGERS
-- ---------------------------------------------------------

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------
-- 1. Table: colleges
-- ---------------------------------------------------------
CREATE TABLE public.colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ---------------------------------------------------------
-- 2. Table: users
-- ---------------------------------------------------------
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'owner', 'admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'verified', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------
-- 3. Table: student_profiles
-- ---------------------------------------------------------
CREATE TABLE public.student_profiles (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
    full_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    age INT,
    major_course VARCHAR(100),
    academic_year INT,
    current_semester INT,
    avatar_url VARCHAR(250),
    bio TEXT,
    hometown_district TEXT NOT NULL,
    current_city TEXT NOT NULL,
    preferred_relocation_city TEXT,
    budget_min NUMERIC(10, 2),
    budget_max NUMERIC(10, 2),
    verification_status VARCHAR(30) DEFAULT 'UNVERIFIED',
    verification_level VARCHAR(30) DEFAULT 'UNVERIFIED',
    college_registration_number VARCHAR(50),
    document_image_url VARCHAR(250),
    trust_score INT DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TRIGGER trigger_update_student_profiles_updated_at
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------
-- 4. Table: student_interests (ElementCollection join table)
-- ---------------------------------------------------------
CREATE TABLE public.student_interests (
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    interest VARCHAR(100) NOT NULL,
    PRIMARY KEY (profile_id, interest)
);

-- ---------------------------------------------------------
-- 5. Table: student_skills (ElementCollection join table)
-- ---------------------------------------------------------
CREATE TABLE public.student_skills (
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    skill VARCHAR(100) NOT NULL,
    PRIMARY KEY (profile_id, skill)
);

-- ---------------------------------------------------------
-- 6. Table: student_languages (ElementCollection join table)
-- ---------------------------------------------------------
CREATE TABLE public.student_languages (
    profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    language VARCHAR(100) NOT NULL,
    PRIMARY KEY (profile_id, language)
);

-- ---------------------------------------------------------
-- 7. Table: listings
-- ---------------------------------------------------------
CREATE TABLE public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    rent_amount NUMERIC(10, 2) NOT NULL,
    deposit_amount NUMERIC(10, 2) NOT NULL,
    location_lat DOUBLE PRECISION NOT NULL,
    location_lng DOUBLE PRECISION NOT NULL,
    room_type VARCHAR(20) NOT NULL,
    gender_preference VARCHAR(15) NOT NULL,
    distance_from_college_text VARCHAR(100),
    rating DOUBLE PRECISION DEFAULT 5.0,
    review_count INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TRIGGER trigger_update_listings_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------
-- 8. Table: listing_amenities (ElementCollection join table)
-- ---------------------------------------------------------
CREATE TABLE public.listing_amenities (
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    amenity VARCHAR(100) NOT NULL,
    PRIMARY KEY (listing_id, amenity)
);

-- ---------------------------------------------------------
-- 9. Table: listing_images
-- ---------------------------------------------------------
CREATE TABLE public.listing_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ---------------------------------------------------------
-- 10. Table: roommate_preferences
-- ---------------------------------------------------------
CREATE TABLE public.roommate_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    smoking INT NOT NULL,
    drinking INT NOT NULL,
    sleep_schedule INT NOT NULL,
    cleanliness INT NOT NULL,
    budget_min NUMERIC(12, 2) NOT NULL,
    budget_max NUMERIC(12, 2) NOT NULL,
    study_habits INT NOT NULL,
    food_preference INT NOT NULL,
    social_level INT NOT NULL,
    noise_tolerance INT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TRIGGER trigger_update_roommate_preferences_updated_at
    BEFORE UPDATE ON public.roommate_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------
-- 11. Table: roommate_actions
-- ---------------------------------------------------------
CREATE TABLE public.roommate_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_roommate_action UNIQUE(user_id, target_user_id, action_type)
);

-- ---------------------------------------------------------
-- 12. Table: saved_rooms
-- ---------------------------------------------------------
CREATE TABLE public.saved_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_user_saved_listing UNIQUE(user_id, listing_id)
);

-- ---------------------------------------------------------
-- 13. Table: conversations
-- ---------------------------------------------------------
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ---------------------------------------------------------
-- 14. Table: conversation_participants (ManyToMany Join Table)
-- ---------------------------------------------------------
CREATE TABLE public.conversation_participants (
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, user_id)
);

-- ---------------------------------------------------------
-- 15. Table: messages
-- ---------------------------------------------------------
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) NOT NULL,
    shared_resource_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ---------------------------------------------------------
-- 16. Table: notifications
-- ---------------------------------------------------------
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ---------------------------------------------------------
-- 17. Table: trust_reports
-- ---------------------------------------------------------
CREATE TABLE public.trust_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    report_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ---------------------------------------------------------
-- 18. Table: communities
-- ---------------------------------------------------------
CREATE TABLE public.communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    creator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TRIGGER trigger_update_communities_updated_at
    BEFORE UPDATE ON public.communities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------
-- 18.5 Table: community_members
-- ---------------------------------------------------------
CREATE TABLE public.community_members (
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    PRIMARY KEY (community_id, user_id)
);

-- ---------------------------------------------------------
-- 19. Table: posts
-- ---------------------------------------------------------
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TRIGGER trigger_update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------
-- 20. Table: comments
-- ---------------------------------------------------------
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TRIGGER trigger_update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------
-- 21. Table: post_likes
-- ---------------------------------------------------------
CREATE TABLE public.post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_post_like UNIQUE (post_id, user_id)
);

-- ---------------------------------------------------------
-- 22. Table: poll_options
-- ---------------------------------------------------------
CREATE TABLE public.poll_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    option_text VARCHAR(200) NOT NULL,
    votes INT DEFAULT 0
);

-- ---------------------------------------------------------
-- 23. Table: relocation_progress
-- ---------------------------------------------------------
CREATE TABLE public.relocation_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    checklist_json TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TRIGGER trigger_update_relocation_progress_updated_at
    BEFORE UPDATE ON public.relocation_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ---------------------------------------------------------
-- PERFORMANCE OPTIMIZING SEARCH INDEXES
-- ---------------------------------------------------------
CREATE INDEX idx_student_colleges ON public.student_profiles(college_id);
CREATE INDEX idx_student_traits ON public.student_profiles(current_city, hometown_district);
CREATE INDEX idx_listings_search ON public.listings(room_type, gender_preference, is_available);
CREATE INDEX idx_listings_rent_amount ON public.listings(rent_amount);
CREATE INDEX idx_roommate_budget ON public.roommate_preferences(budget_min, budget_max);
CREATE INDEX idx_messaging_thread ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_notifications_recipient ON public.notifications(user_id, is_read);
CREATE INDEX idx_saved_rooms_user ON public.saved_rooms(user_id);

-- ---------------------------------------------------------
-- EXPANDED SCHEMAS FOR ROLE/VERIFICATION REDESIGN
-- ---------------------------------------------------------
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS verification_status VARCHAR(30) DEFAULT 'PENDING';
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS geom geography(Point, 4326);

CREATE OR REPLACE FUNCTION update_listings_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.location_lng, NEW.location_lat), 4326)::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_listings_geom
    BEFORE INSERT OR UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION update_listings_geom();

CREATE TABLE IF NOT EXISTS public.verification_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    registration_number VARCHAR(100) NOT NULL,
    document_image_url VARCHAR(250) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    ocr_name VARCHAR(100),
    ocr_similarity VARCHAR(20),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    affected_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    affected_listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    reason TEXT,
    previous_status VARCHAR(30),
    new_status VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

