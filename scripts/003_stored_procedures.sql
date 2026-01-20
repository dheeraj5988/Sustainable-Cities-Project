-- ============================================================================
-- Stored Procedures
-- ============================================================================

-- GET_USER_REPORTS - Bypass RLS for admin dashboard
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_reports(user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  location TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  category TEXT,
  status TEXT,
  priority TEXT,
  assigned_to UUID,
  before_image_url TEXT,
  after_image_url TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.user_id,
    r.title,
    r.description,
    r.location,
    r.latitude,
    r.longitude,
    r.category,
    r.status,
    r.priority,
    r.assigned_to,
    r.before_image_url,
    r.after_image_url,
    r.resolution_notes,
    r.created_at,
    r.updated_at,
    r.resolved_at
  FROM reports r
  WHERE r.user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE_PROFILE_SAFELY - Create profile after auth signup
-- ============================================================================
CREATE OR REPLACE FUNCTION create_profile_safely(
  user_id UUID,
  user_email TEXT,
  first_name TEXT DEFAULT NULL,
  last_name TEXT DEFAULT NULL,
  user_role TEXT DEFAULT 'citizen'
)
RETURNS void AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name, role)
  VALUES (user_id, user_email, first_name, last_name, user_role)
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- GET_ALL_REPORTS - For admin dashboard (bypass RLS)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_all_reports()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  location TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  category TEXT,
  status TEXT,
  priority TEXT,
  assigned_to UUID,
  before_image_url TEXT,
  after_image_url TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  reporter_email TEXT,
  worker_email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.user_id,
    r.title,
    r.description,
    r.location,
    r.latitude,
    r.longitude,
    r.category,
    r.status,
    r.priority,
    r.assigned_to,
    r.before_image_url,
    r.after_image_url,
    r.resolution_notes,
    r.created_at,
    r.updated_at,
    r.resolved_at,
    p1.email,
    p2.email
  FROM reports r
  LEFT JOIN profiles p1 ON r.user_id = p1.id
  LEFT JOIN profiles p2 ON r.assigned_to = p2.id
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
