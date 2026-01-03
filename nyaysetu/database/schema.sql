-- =============================================
-- NYAYASETU DATABASE SCHEMA
-- Methodology: Bagui & Earp (EER Mapping Rule 15)
-- =============================================

-- 1. ENUMS (For Data Integrity)
CREATE TYPE user_role_type AS ENUM ('client', 'lawyer', 'staff', 'admin');
CREATE TYPE verify_status AS ENUM ('pending', 'verified', 'rejected', 'suspended');
CREATE TYPE consult_status AS ENUM ('requested', 'accepted', 'declined', 'completed', 'disputed');
CREATE TYPE doc_access AS ENUM ('private', 'shared', 'public');

-- =============================================
-- 2. SUPERCLASS: PERSON (The Identity Store)
-- Stores authentication data common to all actors
-- =============================================
CREATE TABLE persons (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- For Staff/Admin who might use email/pass
    full_name VARCHAR(100) NOT NULL,
    role user_role_type NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 3. SUBCLASSES (Specialized Profiles)
-- Mapped using Same PK as Superclass (1:1 Relationship)
-- =============================================

-- 3a. CLIENT PROFILE (The Seeker)
-- Implements "Connect Scarcity" Logic
CREATE TABLE clients (
    user_id UUID PRIMARY KEY REFERENCES persons(user_id) ON DELETE CASCADE,
    
    -- SCARCITY ENFORCEMENT
    daily_connect_count INT DEFAULT 0,
    last_connect_date DATE DEFAULT CURRENT_DATE,
    
    city VARCHAR(50)
);

-- 3b. LAWYER PROFILE (The Partner)
-- Implements "Intake Scarcity" & "Verification" Logic
CREATE TABLE lawyers (
    user_id UUID PRIMARY KEY REFERENCES persons(user_id) ON DELETE CASCADE,
    
    -- PROFESSIONAL IDENTITY
    bar_council_id VARCHAR(50) UNIQUE NOT NULL,
    bio TEXT,
    experience_years INT,
    profile_image_url TEXT,
    verification_doc_url TEXT,
    
    -- STATUS & REPUTATION
    verification_status verify_status DEFAULT 'pending',
    is_premium BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    review_count INT DEFAULT 0,
    
    -- SCARCITY ENFORCEMENT (Intake)
    monthly_intake_limit INT DEFAULT 10, -- Limit for free tier
    current_month_connects INT DEFAULT 0,
    
    -- AUDIT
    verified_by_staff_id UUID REFERENCES persons(user_id) -- Who approved them?
);

-- 3c. STAFF PROFILE (Internal)
-- Implements RBAC (Role Based Access Control)
CREATE TABLE staff (
    user_id UUID PRIMARY KEY REFERENCES persons(user_id) ON DELETE CASCADE,
    department VARCHAR(50), -- 'Finance', 'Grievance', 'Content'
    permissions JSONB -- Stores specific access rights e.g. {"can_ban": true}
);

-- =============================================
-- 4. MASTER DATA & MAPPINGS (Multivalued Attributes)
-- Mapped using Mapping Rule 4 (Separate Tables)
-- =============================================

CREATE TABLE master_courts (
    court_id SERIAL PRIMARY KEY,
    court_name VARCHAR(100) NOT NULL,
    city VARCHAR(50),
    type VARCHAR(20) -- 'Supreme', 'High', 'District'
);

CREATE TABLE master_categories (
    cat_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL -- 'Criminal', 'Civil', 'Corporate'
);

-- Lawyer-Court Mapping (M:N Relationship)
CREATE TABLE lawyer_courts (
    lawyer_id UUID REFERENCES lawyers(user_id) ON DELETE CASCADE,
    court_id INT REFERENCES master_courts(court_id),
    PRIMARY KEY (lawyer_id, court_id)
);

-- Lawyer-Specialization Mapping (M:N Relationship)
CREATE TABLE lawyer_specialties (
    lawyer_id UUID REFERENCES lawyers(user_id) ON DELETE CASCADE,
    cat_id INT REFERENCES master_categories(cat_id),
    PRIMARY KEY (lawyer_id, cat_id)
);

-- =============================================
-- 5. TRANSACTIONS & INTERACTIONS (The Core Loop)
-- =============================================

-- CONSULTATIONS (The "Connect" Action)
CREATE TABLE consultations (
    consult_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(user_id),
    lawyer_id UUID REFERENCES lawyers(user_id),
    
    status consult_status DEFAULT 'requested',
    case_description TEXT,
    
    -- LOGGING
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_at TIMESTAMP, -- For Premium Appointment feature
    closed_at TIMESTAMP
);

-- DOCUMENTS (Weak Entity dependent on Consultation or User)
-- Mapped using Mapping Rule 11 (Include Owner Key)
CREATE TABLE documents (
    doc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES persons(user_id), -- Who uploaded it
    consult_id UUID REFERENCES consultations(consult_id), -- Optional: Link to specific case
    
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(10), -- 'pdf', 'jpg'
    
    access_level doc_access DEFAULT 'private',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 6. ADMIN & GOVERNANCE
-- =============================================

CREATE TABLE grievances (
    ticket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raised_by UUID REFERENCES persons(user_id),
    target_user UUID REFERENCES persons(user_id), -- Optional (if reporting a lawyer)
    
    subject VARCHAR(255),
    description TEXT,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'investigating', 'resolved'
    
    assigned_to_staff UUID REFERENCES staff(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    txn_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES persons(user_id), -- Payer
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(20), -- 'subscription', 'consultation_fee'
    status VARCHAR(20), -- 'success', 'failed', 'refunded'
    
    gateway_ref_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 7. INDEXES (For Performance)
-- =============================================
CREATE INDEX idx_lawyer_city ON lawyers(user_id); -- Note: City is derived from linked tables usually, or added to lawyer table if needed for speed
CREATE INDEX idx_consult_lawyer ON consultations(lawyer_id, status);
CREATE INDEX idx_grievance_status ON grievances(status);