-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Player profiles
CREATE TABLE player_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  class TEXT CHECK (class IN ('wraithblade','ironbound','voidcaller','ashensage','wanderer')) DEFAULT 'wanderer',
  level INTEGER DEFAULT 1,
  combat_xp BIGINT DEFAULT 0,
  craft_xp BIGINT DEFAULT 0,
  dust BIGINT DEFAULT 500,
  shards INTEGER DEFAULT 0,
  arena_rating INTEGER DEFAULT 1000,
  guild_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory items
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  name TEXT NOT NULL,
  item_type TEXT NOT NULL,
  slot TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common','rare','epic','legendary','abyssal')),
  required_level INTEGER DEFAULT 1,
  stats JSONB NOT NULL DEFAULT '[]',
  passive_trait TEXT,
  unique_ability TEXT,
  rune_slots INTEGER DEFAULT 0,
  socketed_runes JSONB DEFAULT '[]',
  is_tradeable BOOLEAN DEFAULT true,
  acquired_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipped items (join to inventory_items)
CREATE TABLE player_equipment (
  player_id UUID PRIMARY KEY REFERENCES player_profiles(id) ON DELETE CASCADE,
  weapon UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  offhand UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  helmet UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  chest UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  gloves UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  boots UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  ring1 UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  ring2 UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  amulet UUID REFERENCES inventory_items(id) ON DELETE SET NULL
);

-- Skill trees (unlocked nodes per player)
CREATE TABLE player_skills (
  player_id UUID REFERENCES player_profiles(id) ON DELETE CASCADE,
  skill_node_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (player_id, skill_node_id)
);

-- Guilds
CREATE TABLE guilds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  leader_id UUID NOT NULL REFERENCES player_profiles(id),
  guild_xp BIGINT DEFAULT 0,
  guild_level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE player_profiles ADD CONSTRAINT fk_guild_id FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE SET NULL;

-- Auction listings
CREATE TABLE auction_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES player_profiles(id),
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  price BIGINT NOT NULL,
  currency TEXT DEFAULT 'dust' CHECK (currency IN ('dust','shards')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','sold','expired','cancelled')),
  expires_at TIMESTAMPTZ NOT NULL,
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wager duels
CREATE TABLE wager_duels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiator_id UUID NOT NULL REFERENCES player_profiles(id),
  opponent_id UUID REFERENCES player_profiles(id),
  stake_type TEXT NOT NULL CHECK (stake_type IN ('dust','item')),
  initiator_stake_amount BIGINT,
  initiator_stake_item UUID REFERENCES inventory_items(id),
  opponent_stake_amount BIGINT,
  opponent_stake_item UUID REFERENCES inventory_items(id),
  winner_id UUID REFERENCES player_profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','escrowed','in_progress','completed','cancelled')),
  arena_room_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Arena match history
CREATE TABLE arena_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mode TEXT NOT NULL CHECK (mode IN ('ranked_1v1','ranked_3v3','deathmatch')),
  winner_id UUID REFERENCES player_profiles(id),
  participants JSONB NOT NULL,  -- [{player_id, rating_before, rating_after, kills, deaths}]
  duration_seconds INTEGER,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily quests
CREATE TABLE daily_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  quest_template_id TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  reward_claimed BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Players can view own profile" ON player_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Players can update own profile" ON player_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Players can view own items" ON inventory_items FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Auction listings are public" ON auction_listings FOR SELECT TO public USING (status = 'active');
CREATE POLICY "Players can create listings" ON auction_listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
