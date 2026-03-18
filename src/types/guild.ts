// ============================================
// THE FORGE — Guild System Types
// ============================================

export type GuildType = 'open' | 'application' | 'invite';
export type GuildRole = 'blacksmith' | 'striker' | 'tempered' | 'heated' | 'raw';
export type GuildTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'obsidian';
export type QuestType = 'weekly' | 'challenge' | 'brotherhood' | 'external' | 'sprint';
export type QuestStatus = 'active' | 'completed' | 'failed' | 'cancelled';
export type QuestParticipantStatus = 'assigned' | 'accepted' | 'in_progress' | 'proof_submitted' | 'approved' | 'rejected';
export type ChallengeType = 'spark_duel' | 'heat_wave' | 'iron_week' | 'blacksmith_bet';
export type ChallengeStatus = 'pending' | 'accepted' | 'rejected' | 'live' | 'completed';
export type SeasonStatus = 'upcoming' | 'active' | 'completed';
export type TierChange = 'ascend' | 'hold' | 'descend';
export type GuildChannel = 'general' | 'command' | 'forge_room' | 'war_room';
export type PersonalRank = 'ore' | 'iron' | 'steel' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'obsidian' | 'forged';

export interface Guild {
  id: string;
  name: string;
  slug: string;
  motto: string | null;
  description: string | null;
  emblem_url: string | null;
  emblem_config: EmblemConfig;
  guild_type: GuildType;
  rules: GuildRule[];
  level: number;
  total_points: number;
  season_points: number;
  treasury_points: number;
  heat_level: number;
  tier: GuildTier;
  max_members: number;
  member_count: number;
  min_streak_requirement: number;
  min_phase_requirement: number;
  min_score_requirement: number;
  founder_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmblemConfig {
  symbol?: string;
  colors?: string[];
  frame_style?: string;
  slogan?: string;
}

export interface GuildRule {
  id: string;
  text: string;
  created_at: string;
}

export interface GuildMember {
  id: string;
  guild_id: string;
  user_id: string;
  role: GuildRole;
  joined_at: string;
  promoted_at: string | null;
  contribution_points: number;
  is_active: boolean;
  // Joined fields
  profile?: {
    full_name: string;
    avatar_url: string | null;
    streak: number;
    current_phase: number;
    current_week: number;
  };
}

export interface GuildQuest {
  id: string;
  guild_id: string;
  created_by: string;
  title: string;
  description: string | null;
  quest_type: QuestType;
  target_value: number | null;
  current_value: number;
  points_reward: number;
  starts_at: string;
  ends_at: string;
  status: QuestStatus;
  completion_rate: number;
  created_at: string;
}

export interface GuildQuestParticipant {
  id: string;
  quest_id: string;
  user_id: string;
  status: QuestParticipantStatus;
  proof_url: string | null;
  proof_note: string | null;
  completed_at: string | null;
  reviewed_by: string | null;
}

export interface Season {
  id: string;
  name: string;
  season_number: number;
  year: number;
  starts_at: string;
  ends_at: string;
  status: SeasonStatus;
  created_at: string;
}

export interface SeasonResult {
  id: string;
  season_id: string;
  guild_id: string;
  final_score: number;
  final_tier: string;
  tier_change: TierChange | null;
  rank_in_tier: number | null;
  created_at: string;
}

export interface GuildChallenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  challenge_type: ChallengeType;
  challenger_score: number;
  challenged_score: number;
  winner_id: string | null;
  status: ChallengeStatus;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  // Joined
  challenger?: Guild;
  challenged?: Guild;
}

export interface GuildMessage {
  id: string;
  guild_id: string;
  user_id: string;
  channel: GuildChannel;
  content: string;
  created_at: string;
  // Joined
  profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export interface WeeklyRanking {
  id: string;
  guild_id: string;
  week_start: string;
  rank_position: number;
  score: number;
  is_forge_of_week: boolean;
  is_rising_fire: boolean;
  created_at: string;
  // Joined
  guild?: Guild;
}

// Helper constants
export const GUILD_ROLE_ORDER: Record<GuildRole, number> = {
  blacksmith: 5,
  striker: 4,
  tempered: 3,
  heated: 2,
  raw: 1,
};

export const GUILD_ROLE_LABELS: Record<GuildRole, string> = {
  blacksmith: 'Blacksmith',
  striker: 'Striker',
  tempered: 'Tempered',
  heated: 'Heated',
  raw: 'Raw',
};

export const GUILD_ROLE_COLORS: Record<GuildRole, string> = {
  blacksmith: '#FF4500',
  striker: '#FF8C00',
  tempered: '#C0C0C0',
  heated: '#CD7F32',
  raw: '#808080',
};

export const TIER_CONFIG: Record<GuildTier, { label: string; color: string; glow: string; bg: string }> = {
  bronze: { label: 'Bronze', color: '#CD7F32', glow: 'rgba(205,127,50,0.4)', bg: 'rgba(205,127,50,0.1)' },
  silver: { label: 'Silver', color: '#C0C0C0', glow: 'rgba(192,192,192,0.4)', bg: 'rgba(192,192,192,0.1)' },
  gold: { label: 'Gold', color: '#FFD700', glow: 'rgba(255,215,0,0.4)', bg: 'rgba(255,215,0,0.1)' },
  diamond: { label: 'Diamond', color: '#00BFFF', glow: 'rgba(0,191,255,0.4)', bg: 'rgba(0,191,255,0.1)' },
  obsidian: { label: 'Obsidian', color: '#FF2400', glow: 'rgba(255,36,0,0.5)', bg: 'rgba(255,36,0,0.1)' },
};

export const LEVEL_CONFIG: Record<number, { name: string; requiredPoints: number; maxMembers: number }> = {
  1: { name: 'Spark', requiredPoints: 0, maxMembers: 5 },
  2: { name: 'Flame', requiredPoints: 500, maxMembers: 10 },
  3: { name: 'Ember', requiredPoints: 1500, maxMembers: 15 },
  4: { name: 'Blaze', requiredPoints: 3500, maxMembers: 20 },
  5: { name: 'Steel', requiredPoints: 7000, maxMembers: 30 },
  6: { name: 'Blade', requiredPoints: 12000, maxMembers: 40 },
  7: { name: 'Shield', requiredPoints: 20000, maxMembers: 50 },
  8: { name: 'Throne', requiredPoints: 35000, maxMembers: 75 },
  9: { name: 'Dynasty', requiredPoints: 60000, maxMembers: 100 },
  10: { name: 'Eternal', requiredPoints: 100000, maxMembers: 150 },
};

export const RANK_CONFIG: Record<PersonalRank, { label: string; min: number; max: number; color: string; icon: string }> = {
  ore: { label: 'Ore', min: 0, max: 499, color: '#666', icon: '�ite' },
  iron: { label: 'Iron', min: 500, max: 1499, color: '#888', icon: 'Fe' },
  steel: { label: 'Steel', min: 1500, max: 3499, color: '#B0B0B0', icon: 'St' },
  bronze: { label: 'Bronze', min: 3500, max: 6999, color: '#CD7F32', icon: 'Br' },
  silver: { label: 'Silver', min: 7000, max: 11999, color: '#C0C0C0', icon: 'Ag' },
  gold: { label: 'Gold', min: 12000, max: 19999, color: '#FFD700', icon: 'Au' },
  platinum: { label: 'Platinum', min: 20000, max: 34999, color: '#E5E4E2', icon: 'Pt' },
  diamond: { label: 'Diamond', min: 35000, max: 59999, color: '#00BFFF', icon: 'Di' },
  obsidian: { label: 'Obsidian', min: 60000, max: 99999, color: '#FF2400', icon: 'Ob' },
  forged: { label: 'FORGED', min: 100000, max: Infinity, color: '#FF4500', icon: 'FG' },
};

export function getPersonalRank(points: number): PersonalRank {
  if (points >= 100000) return 'forged';
  if (points >= 60000) return 'obsidian';
  if (points >= 35000) return 'diamond';
  if (points >= 20000) return 'platinum';
  if (points >= 12000) return 'gold';
  if (points >= 7000) return 'silver';
  if (points >= 3500) return 'bronze';
  if (points >= 1500) return 'steel';
  if (points >= 500) return 'iron';
  return 'ore';
}

export function getHeatLabel(heat: number): { label: string; color: string } {
  if (heat >= 80) return { label: 'White Hot', color: '#FFFFFF' };
  if (heat >= 50) return { label: 'Burning', color: '#FF8C00' };
  if (heat >= 25) return { label: 'Cooling', color: '#888888' };
  return { label: 'Cold Iron', color: '#444444' };
}
