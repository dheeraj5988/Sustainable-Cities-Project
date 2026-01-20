-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES RLS POLICIES
-- ============================================================================
-- Anyone can view profiles
CREATE POLICY "profiles_read_all" ON profiles
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- REPORTS RLS POLICIES
-- ============================================================================
-- Anyone can view reports
CREATE POLICY "reports_read_all" ON reports
  FOR SELECT
  USING (true);

-- Users can create reports
CREATE POLICY "reports_create" ON reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Report creator or assigned worker or admin can update
CREATE POLICY "reports_update_own_or_assigned_or_admin" ON reports
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    auth.uid() = assigned_to OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    auth.uid() = user_id OR
    auth.uid() = assigned_to OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Only admin can delete reports
CREATE POLICY "reports_delete_admin_only" ON reports
  FOR DELETE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- COMMENTS RLS POLICIES
-- ============================================================================
-- Anyone can view comments
CREATE POLICY "comments_read_all" ON comments
  FOR SELECT
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "comments_create" ON comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Comment author can update their own comments
CREATE POLICY "comments_update_own" ON comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Comment author or admin can delete
CREATE POLICY "comments_delete_own_or_admin" ON comments
  FOR DELETE
  USING (
    auth.uid() = user_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- FORUM_POSTS RLS POLICIES
-- ============================================================================
-- Anyone can view forum posts
CREATE POLICY "forum_posts_read_all" ON forum_posts
  FOR SELECT
  USING (true);

-- Authenticated users can create posts
CREATE POLICY "forum_posts_create" ON forum_posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Post author or admin can update
CREATE POLICY "forum_posts_update_own_or_admin" ON forum_posts
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    auth.uid() = user_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Post author or admin can delete
CREATE POLICY "forum_posts_delete_own_or_admin" ON forum_posts
  FOR DELETE
  USING (
    auth.uid() = user_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- FORUM_REPLIES RLS POLICIES
-- ============================================================================
-- Anyone can view forum replies
CREATE POLICY "forum_replies_read_all" ON forum_replies
  FOR SELECT
  USING (true);

-- Authenticated users can create replies
CREATE POLICY "forum_replies_create" ON forum_replies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Reply author or admin can update
CREATE POLICY "forum_replies_update_own_or_admin" ON forum_replies
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    auth.uid() = user_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Reply author or admin can delete
CREATE POLICY "forum_replies_delete_own_or_admin" ON forum_replies
  FOR DELETE
  USING (
    auth.uid() = user_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- INVITES RLS POLICIES
-- ============================================================================
-- Only admins can view invites
CREATE POLICY "invites_read_admin_only" ON invites
  FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Only admins can create invites
CREATE POLICY "invites_create_admin_only" ON invites
  FOR INSERT
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- NOTIFICATIONS RLS POLICIES
-- ============================================================================
-- Users can only view their own notifications
CREATE POLICY "notifications_read_own" ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can create notifications (service role)
CREATE POLICY "notifications_create_service_role" ON notifications
  FOR INSERT
  WITH CHECK (true);
