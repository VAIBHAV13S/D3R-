-- Portable SQL schema for core tables
-- Compatible with Postgres/MySQL/SQLite (types chosen for portability)

-- Users table
CREATE TABLE IF NOT EXISTS Users (
  id              VARCHAR(100) PRIMARY KEY,
  walletAddress   VARCHAR(64) NOT NULL,
  displayName     VARCHAR(100),
  totalDonated    DECIMAL(38,18) NOT NULL DEFAULT 0,
  createdAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_wallet UNIQUE (walletAddress)
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS Campaigns (
  id              VARCHAR(100) PRIMARY KEY,
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  disasterId      VARCHAR(64),
  imageCID        VARCHAR(100),
  targetAmount    DECIMAL(38,18) NOT NULL,
  currentAmount   DECIMAL(38,18) NOT NULL DEFAULT 0,
  creator         VARCHAR(100) NOT NULL,
  deadline        TIMESTAMP,
  status          VARCHAR(32) NOT NULL,
  createdAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_campaigns_creator FOREIGN KEY (creator) REFERENCES Users(id)
);

-- Donations table
CREATE TABLE IF NOT EXISTS Donations (
  id            VARCHAR(100) PRIMARY KEY,
  campaignId    VARCHAR(100) NOT NULL,
  donor         VARCHAR(100) NOT NULL,
  amount        DECIMAL(38,18) NOT NULL,
  txHash        VARCHAR(100) NOT NULL,
  status        VARCHAR(32) NOT NULL,
  timestamp     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_donations_campaign FOREIGN KEY (campaignId) REFERENCES Campaigns(id) ON DELETE CASCADE,
  CONSTRAINT fk_donations_donor FOREIGN KEY (donor) REFERENCES Users(id),
  CONSTRAINT uq_donations_tx UNIQUE (txHash)
);

-- Milestones table
CREATE TABLE IF NOT EXISTS Milestones (
  id            VARCHAR(100) PRIMARY KEY,
  campaignId    VARCHAR(100) NOT NULL,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  proofCID      VARCHAR(200),
  approved      BOOLEAN NOT NULL DEFAULT FALSE,
  fundAmount    DECIMAL(38,18) NOT NULL DEFAULT 0,
  releasedAt    TIMESTAMP,
  createdAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_milestones_campaign FOREIGN KEY (campaignId) REFERENCES Campaigns(id) ON DELETE CASCADE
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_creator ON Campaigns (creator);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON Campaigns (status);
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON Donations (campaignId);
CREATE INDEX IF NOT EXISTS idx_donations_donor ON Donations (donor);
CREATE INDEX IF NOT EXISTS idx_donations_status ON Donations (status);
CREATE INDEX IF NOT EXISTS idx_milestones_campaign ON Milestones (campaignId);
CREATE INDEX IF NOT EXISTS idx_users_createdAt ON Users (createdAt);

-- UploadedFiles table to persist IPFS CIDs and metadata
CREATE TABLE IF NOT EXISTS UploadedFiles (
  id            VARCHAR(100) PRIMARY KEY,
  cid           VARCHAR(100) NOT NULL,
  documentType  VARCHAR(64) NOT NULL,
  uploader      VARCHAR(100),
  originalName  VARCHAR(255),
  mimeType      VARCHAR(128),
  sizeBytes     BIGINT,
  createdAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_uploadedfiles_cid UNIQUE (cid),
  CONSTRAINT fk_uploadedfiles_uploader FOREIGN KEY (uploader) REFERENCES Users(id)
);

CREATE INDEX IF NOT EXISTS idx_uploadedfiles_uploader ON UploadedFiles (uploader);
CREATE INDEX IF NOT EXISTS idx_uploadedfiles_createdAt ON UploadedFiles (createdAt);

-- DisasterVerifications table
CREATE TABLE IF NOT EXISTS DisasterVerifications (
  id           VARCHAR(36) PRIMARY KEY,
  disasterId   VARCHAR(128) NOT NULL,
  latitude     DECIMAL(9,6),
  longitude    DECIMAL(9,6),
  eventType    VARCHAR(64),
  status       VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending|verified|failed
  confidence   DECIMAL(5,2), -- 0-100
  txHash       VARCHAR(100),
  createdAt    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_disaster_verifications UNIQUE (disasterId)
);

CREATE INDEX IF NOT EXISTS idx_disasterverifications_disasterId ON DisasterVerifications (disasterId);
CREATE INDEX IF NOT EXISTS idx_disasterverifications_status ON DisasterVerifications (status);

-- Postgres-only: updatedAt trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updatedAt := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- Users updatedAt trigger
DROP TRIGGER IF EXISTS trg_users_set_updated_at ON Users;
CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON Users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Campaigns updatedAt trigger
DROP TRIGGER IF EXISTS trg_campaigns_set_updated_at ON Campaigns;
CREATE TRIGGER trg_campaigns_set_updated_at
BEFORE UPDATE ON Campaigns
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Donations updatedAt trigger
DROP TRIGGER IF EXISTS trg_donations_set_updated_at ON Donations;
CREATE TRIGGER trg_donations_set_updated_at
BEFORE UPDATE ON Donations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Milestones updatedAt trigger
DROP TRIGGER IF EXISTS trg_milestones_set_updated_at ON Milestones;
CREATE TRIGGER trg_milestones_set_updated_at
BEFORE UPDATE ON Milestones
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Backfill compatibility: ensure columns exist if tables were created before timestamp additions
ALTER TABLE IF EXISTS Users
  ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE IF EXISTS Campaigns
  ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE IF EXISTS Donations
  ADD COLUMN IF NOT EXISTS createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE IF EXISTS Milestones
  ADD COLUMN IF NOT EXISTS createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE IF EXISTS UploadedFiles
  ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

DROP TRIGGER IF EXISTS trg_uploadedfiles_set_updated_at ON UploadedFiles;
CREATE TRIGGER trg_uploadedfiles_set_updated_at
BEFORE UPDATE ON UploadedFiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE IF EXISTS DisasterVerifications
  ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

DROP TRIGGER IF EXISTS trg_disasterverifications_set_updated_at ON DisasterVerifications;
CREATE TRIGGER trg_disasterverifications_set_updated_at
BEFORE UPDATE ON DisasterVerifications
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
