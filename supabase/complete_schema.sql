-- ============================================
-- SCHEMA COMPLETO PARA RED SOCIAL
-- ============================================

-- ============================================
-- 1. TABLAS BASE
-- ============================================

-- Tabla de Perfiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(30) UNIQUE NOT NULL,
  email VARCHAR(255),
  bio TEXT,
  location VARCHAR(100),
  website VARCHAR(255),
  avatar_url TEXT,
  cover_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  private_account BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Tabla de Posts
CREATE TABLE IF NOT EXISTS posts (
  id BIGSERIAL PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  retweets_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Tabla de Comentarios
CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Tabla de Likes
CREATE TABLE IF NOT EXISTS likes (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  UNIQUE(post_id, user_id)
);

-- Tabla de Seguimientos
CREATE TABLE IF NOT EXISTS follows (
  id BIGSERIAL PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Tabla de Bloqueos
CREATE TABLE IF NOT EXISTS blocks (
  id BIGSERIAL PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- Tabla de Notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'like', 'follow', 'reply', 'mention', 'repost'
  content TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Tabla de Historial de Búsquedas
CREATE TABLE IF NOT EXISTS search_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  query VARCHAR(255) NOT NULL,
  type VARCHAR(50), -- 'people', 'posts', 'general'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Tabla de Configuraciones del Usuario
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light', -- 'light', 'dark', 'auto'
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  private_account BOOLEAN DEFAULT FALSE,
  show_analytics BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- ============================================
-- 2. ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocker_id ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- ============================================
-- 3. FUNCIONES DE BÚSQUEDA
-- ============================================

-- Función para buscar usuarios
CREATE OR REPLACE FUNCTION search_users(search_query TEXT, limit_count INT DEFAULT 20)
RETURNS TABLE(
  id UUID,
  username VARCHAR,
  bio TEXT,
  avatar_url TEXT,
  followers_count INTEGER,
  is_verified BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.bio,
    p.avatar_url,
    p.followers_count,
    p.is_verified
  FROM profiles p
  WHERE p.username ILIKE '%' || search_query || '%'
    OR p.bio ILIKE '%' || search_query || '%'
  ORDER BY p.followers_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Función para buscar posts
CREATE OR REPLACE FUNCTION search_posts(search_query TEXT, limit_count INT DEFAULT 30)
RETURNS TABLE(
  id BIGINT,
  author_id UUID,
  author_username VARCHAR,
  content TEXT,
  likes_count INTEGER,
  comments_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.author_id,
    pr.username,
    p.content,
    p.likes_count,
    p.comments_count,
    p.created_at
  FROM posts p
  JOIN profiles pr ON p.author_id = pr.id
  WHERE p.content ILIKE '%' || search_query || '%'
  ORDER BY p.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. FUNCIONES DE SEGUIMIENTO
-- ============================================

-- Función para verificar si un usuario sigue a otro
CREATE OR REPLACE FUNCTION is_following(p_follower_id UUID, p_following_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM follows
    WHERE follower_id = p_follower_id
      AND following_id = p_following_id
  );
END;
$$ LANGUAGE plpgsql;

-- Función para obtener sugerencias de usuarios
CREATE OR REPLACE FUNCTION get_user_suggestions(p_user_id UUID, p_limit INT DEFAULT 10)
RETURNS TABLE(
  id UUID,
  username VARCHAR,
  bio TEXT,
  avatar_url TEXT,
  followers_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.bio,
    p.avatar_url,
    p.followers_count
  FROM profiles p
  WHERE p.id != p_user_id
    AND p.id NOT IN (
      SELECT following_id FROM follows WHERE follower_id = p_user_id
    )
    AND p.id NOT IN (
      SELECT blocked_id FROM blocks WHERE blocker_id = p_user_id
    )
  ORDER BY p.followers_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. FUNCIONES DE BLOQUEO
-- ============================================

-- Función para verificar si un usuario está bloqueado
CREATE OR REPLACE FUNCTION is_blocked(p_blocker_id UUID, p_blocked_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM blocks
    WHERE blocker_id = p_blocker_id
      AND blocked_id = p_blocked_id
  );
END;
$$ LANGUAGE plpgsql;

-- Función para bloquear un usuario
CREATE OR REPLACE FUNCTION block_user(p_blocker_id UUID, p_blocked_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO blocks(blocker_id, blocked_id)
  VALUES(p_blocker_id, p_blocked_id)
  ON CONFLICT DO NOTHING;
  
  -- Eliminar seguimiento mutuo
  DELETE FROM follows
  WHERE (follower_id = p_blocker_id AND following_id = p_blocked_id)
     OR (follower_id = p_blocked_id AND following_id = p_blocker_id);
END;
$$ LANGUAGE plpgsql;

-- Función para desbloquear un usuario
CREATE OR REPLACE FUNCTION unblock_user(p_blocker_id UUID, p_blocked_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM blocks
  WHERE blocker_id = p_blocker_id
    AND blocked_id = p_blocked_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. FUNCIONES DE LIKES
-- ============================================

-- Función para toggle like
CREATE OR REPLACE FUNCTION toggle_like(p_post_id BIGINT, p_user_id UUID DEFAULT AUTH.UID())
RETURNS TABLE(liked BOOLEAN, likes_count INTEGER) AS $$
DECLARE
  v_liked BOOLEAN;
  v_likes_count INTEGER;
BEGIN
  -- Verificar si ya existe el like
  v_liked := EXISTS(
    SELECT 1 FROM likes
    WHERE post_id = p_post_id AND user_id = p_user_id
  );
  
  IF v_liked THEN
    -- Eliminar like
    DELETE FROM likes
    WHERE post_id = p_post_id AND user_id = p_user_id;
  ELSE
    -- Agregar like
    INSERT INTO likes(post_id, user_id)
    VALUES(p_post_id, p_user_id);
  END IF;
  
  -- Obtener conteo actualizado
  v_likes_count := (SELECT COUNT(*) FROM likes WHERE post_id = p_post_id);
  
  -- Actualizar contador en posts
  UPDATE posts SET likes_count = v_likes_count WHERE id = p_post_id;
  
  -- Retornar resultado
  RETURN QUERY SELECT NOT v_liked, v_likes_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. FUNCIONES DE NOTIFICACIONES
-- ============================================

-- Función para obtener conteo de notificaciones no leídas
CREATE OR REPLACE FUNCTION get_unread_notifications_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = p_user_id AND read = FALSE
  );
END;
$$ LANGUAGE plpgsql;

-- Función para marcar notificaciones como leídas
CREATE OR REPLACE FUNCTION mark_notifications_as_read(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET read = TRUE
  WHERE user_id = p_user_id AND read = FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. FUNCIONES DE TIMELINE
-- ============================================

-- Función para obtener timeline del usuario
CREATE OR REPLACE FUNCTION get_timeline_feed(p_user_id UUID, p_limit INT DEFAULT 20, p_offset INT DEFAULT 0)
RETURNS TABLE(
  id BIGINT,
  author_id UUID,
  author_username VARCHAR,
  author_avatar_url TEXT,
  content TEXT,
  image_url TEXT,
  likes_count INTEGER,
  comments_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  liked_by_user BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.author_id,
    pr.username,
    pr.avatar_url,
    p.content,
    p.image_url,
    p.likes_count,
    p.comments_count,
    p.created_at,
    EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = p_user_id) as liked_by_user
  FROM posts p
  JOIN profiles pr ON p.author_id = pr.id
  WHERE p.author_id = p_user_id
     OR p.author_id IN (
       SELECT following_id FROM follows WHERE follower_id = p_user_id
     )
    AND p.author_id NOT IN (
      SELECT blocked_id FROM blocks WHERE blocker_id = p_user_id
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. TRIGGERS
-- ============================================

-- Trigger para actualizar followers_count al seguir
CREATE OR REPLACE FUNCTION update_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET followers_count = (SELECT COUNT(*) FROM follows WHERE following_id = NEW.following_id)
  WHERE id = NEW.following_id;
  
  UPDATE profiles
  SET following_count = (SELECT COUNT(*) FROM follows WHERE follower_id = NEW.follower_id)
  WHERE id = NEW.follower_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_followers_count
AFTER INSERT ON follows
FOR EACH ROW
EXECUTE FUNCTION update_followers_count();

-- Trigger para actualizar followers_count al dejar de seguir
CREATE OR REPLACE FUNCTION update_followers_count_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET followers_count = (SELECT COUNT(*) FROM follows WHERE following_id = OLD.following_id)
  WHERE id = OLD.following_id;
  
  UPDATE profiles
  SET following_count = (SELECT COUNT(*) FROM follows WHERE follower_id = OLD.follower_id)
  WHERE id = OLD.follower_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_followers_count_delete
AFTER DELETE ON follows
FOR EACH ROW
EXECUTE FUNCTION update_followers_count_delete();

-- Trigger para actualizar posts_count
CREATE OR REPLACE FUNCTION update_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET posts_count = (SELECT COUNT(*) FROM posts WHERE author_id = NEW.author_id)
  WHERE id = NEW.author_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_posts_count
AFTER INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION update_posts_count();

-- Trigger para actualizar posts_count al eliminar
CREATE OR REPLACE FUNCTION update_posts_count_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET posts_count = (SELECT COUNT(*) FROM posts WHERE author_id = OLD.author_id)
  WHERE id = OLD.author_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_posts_count_delete
AFTER DELETE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_posts_count_delete();

-- Trigger para actualizar comments_count
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET comments_count = (SELECT COUNT(*) FROM comments WHERE post_id = NEW.post_id)
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comments_count
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION update_comments_count();

-- Trigger para actualizar comments_count al eliminar
CREATE OR REPLACE FUNCTION update_comments_count_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET comments_count = (SELECT COUNT(*) FROM comments WHERE post_id = OLD.post_id)
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comments_count_delete
AFTER DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_comments_count_delete();

-- Trigger para crear notificación cuando alguien da like
CREATE OR REPLACE FUNCTION create_like_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications(user_id, actor_id, post_id, type, content)
  SELECT 
    p.author_id,
    NEW.user_id,
    NEW.post_id,
    'like',
    'Te dio me gusta en tu post'
  FROM posts p
  WHERE p.id = NEW.post_id AND p.author_id != NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_like_notification
AFTER INSERT ON likes
FOR EACH ROW
EXECUTE FUNCTION create_like_notification();

-- Trigger para crear notificación cuando alguien te sigue
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications(user_id, actor_id, type, content)
  VALUES(
    NEW.following_id,
    NEW.follower_id,
    'follow',
    'Te empezó a seguir'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_follow_notification
AFTER INSERT ON follows
FOR EACH ROW
EXECUTE FUNCTION create_follow_notification();

-- Trigger para crear notificación cuando alguien comenta
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications(user_id, actor_id, post_id, type, content)
  SELECT 
    p.author_id,
    NEW.author_id,
    NEW.post_id,
    'reply',
    'Comentó en tu post: ' || NEW.content
  FROM posts p
  WHERE p.id = NEW.post_id AND p.author_id != NEW.author_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_comment_notification
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION create_comment_notification();

-- ============================================
-- 10. POLÍTICAS RLS (Row Level Security)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para posts
CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (auth.uid() = author_id);

-- Políticas para comments
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = author_id);

-- Políticas para likes
CREATE POLICY "Likes are viewable by everyone" ON likes
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Notifications can be inserted" ON notifications
  FOR INSERT WITH CHECK (TRUE);

-- Políticas para search_history
CREATE POLICY "Users can view their own search history" ON search_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history" ON search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para user_settings
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 11. ALMACENAMIENTO (Storage Buckets)
-- ============================================

-- Nota: Ejecuta estos comandos en la consola de Supabase:
-- 1. Crea bucket 'avatars'
-- 2. Crea bucket 'covers'
-- 3. Crea bucket 'posts'

-- Políticas de Storage
-- Para bucket 'avatars':
-- - SELECT: public
-- - INSERT: authenticated
-- - UPDATE: authenticated
-- - DELETE: authenticated

-- Para bucket 'covers':
-- - SELECT: public
-- - INSERT: authenticated
-- - UPDATE: authenticated
-- - DELETE: authenticated

-- Para bucket 'posts':
-- - SELECT: public
-- - INSERT: authenticated
-- - UPDATE: authenticated
-- - DELETE: authenticated

-- ============================================
-- FIN DEL SCHEMA
-- ============================================
