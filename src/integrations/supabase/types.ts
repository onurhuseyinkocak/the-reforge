export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_key: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_key: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_key?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_notes: {
        Row: {
          admin_id: string
          content: string
          created_at: string
          id: string
          student_id: string
        }
        Insert: {
          admin_id: string
          content: string
          created_at?: string
          id?: string
          student_id: string
        }
        Update: {
          admin_id?: string
          content?: string
          created_at?: string
          id?: string
          student_id?: string
        }
        Relationships: []
      }
      ai_analysis_reports: {
        Row: {
          analysis_date: string
          area: string | null
          created_at: string
          id: string
          recommendations: Json | null
          risk_level: string
          summary: string
          user_id: string
        }
        Insert: {
          analysis_date?: string
          area?: string | null
          created_at?: string
          id?: string
          recommendations?: Json | null
          risk_level?: string
          summary: string
          user_id: string
        }
        Update: {
          analysis_date?: string
          area?: string | null
          created_at?: string
          id?: string
          recommendations?: Json | null
          risk_level?: string
          summary?: string
          user_id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          age: number | null
          commitment_answers: Json | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          situation_ratings: Json | null
          status: string
        }
        Insert: {
          age?: number | null
          commitment_answers?: Json | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          situation_ratings?: Json | null
          status?: string
        }
        Update: {
          age?: number | null
          commitment_answers?: Json | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          situation_ratings?: Json | null
          status?: string
        }
        Relationships: []
      }
      buddy_pairs: {
        Row: {
          created_at: string
          id: string
          status: string
          updated_at: string
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_a?: string
          user_b?: string
        }
        Relationships: []
      }
      checkins: {
        Row: {
          checkin_date: string
          checkin_type: string
          created_at: string
          day_rating: number | null
          energy_rating: number | null
          gratitude: string | null
          id: string
          nutrition_rating: number | null
          priorities: string[] | null
          priority_review: string | null
          reflection: string | null
          routine_done: boolean | null
          sleep_rating: number | null
          user_id: string
          wake_time: string | null
          workout_done: boolean | null
        }
        Insert: {
          checkin_date?: string
          checkin_type: string
          created_at?: string
          day_rating?: number | null
          energy_rating?: number | null
          gratitude?: string | null
          id?: string
          nutrition_rating?: number | null
          priorities?: string[] | null
          priority_review?: string | null
          reflection?: string | null
          routine_done?: boolean | null
          sleep_rating?: number | null
          user_id: string
          wake_time?: string | null
          workout_done?: boolean | null
        }
        Update: {
          checkin_date?: string
          checkin_type?: string
          created_at?: string
          day_rating?: number | null
          energy_rating?: number | null
          gratitude?: string | null
          id?: string
          nutrition_rating?: number | null
          priorities?: string[] | null
          priority_review?: string | null
          reflection?: string | null
          routine_done?: boolean | null
          sleep_rating?: number | null
          user_id?: string
          wake_time?: string | null
          workout_done?: boolean | null
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes_count: number
          phase_group: number
          post_type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          phase_group?: number
          post_type?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          phase_group?: number
          post_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      guild_challenges: {
        Row: {
          challenged_guild_id: string
          challenged_score: number
          challenger_guild_id: string
          challenger_score: number
          created_at: string
          ends_at: string | null
          id: string
          status: string
        }
        Insert: {
          challenged_guild_id: string
          challenged_score?: number
          challenger_guild_id: string
          challenger_score?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          status?: string
        }
        Update: {
          challenged_guild_id?: string
          challenged_score?: number
          challenger_guild_id?: string
          challenger_score?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_challenges_challenged_guild_id_fkey"
            columns: ["challenged_guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_challenges_challenger_guild_id_fkey"
            columns: ["challenger_guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_members: {
        Row: {
          guild_id: string
          id: string
          is_active: boolean
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          guild_id: string
          id?: string
          is_active?: boolean
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          guild_id?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_members_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_messages: {
        Row: {
          content: string
          created_at: string
          guild_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          guild_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          guild_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_messages_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_quests: {
        Row: {
          completion_rate: number
          created_at: string
          description: string | null
          due_date: string | null
          guild_id: string
          id: string
          status: string
          title: string
          xp_reward: number
        }
        Insert: {
          completion_rate?: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          guild_id: string
          id?: string
          status?: string
          title: string
          xp_reward?: number
        }
        Update: {
          completion_rate?: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          guild_id?: string
          id?: string
          status?: string
          title?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "guild_quests_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guilds: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          heat_score: number
          id: string
          is_public: boolean
          level: number
          member_count: number
          name: string
          slug: string
          updated_at: string
          xp: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          heat_score?: number
          id?: string
          is_public?: boolean
          level?: number
          member_count?: number
          name: string
          slug: string
          updated_at?: string
          xp?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          heat_score?: number
          id?: string
          is_public?: boolean
          level?: number
          member_count?: number
          name?: string
          slug?: string
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      life_area_entries: {
        Row: {
          area: string
          created_at: string
          entry_date: string
          id: string
          metrics: Json | null
          photo_urls: Json | null
          user_id: string
        }
        Insert: {
          area: string
          created_at?: string
          entry_date?: string
          id?: string
          metrics?: Json | null
          photo_urls?: Json | null
          user_id: string
        }
        Update: {
          area?: string
          created_at?: string
          entry_date?: string
          id?: string
          metrics?: Json | null
          photo_urls?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      mentor_sessions: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          mentor_id: string
          notes: string | null
          scheduled_at: string
          status: string
          student_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          mentor_id: string
          notes?: string | null
          scheduled_at: string
          status?: string
          student_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          mentor_id?: string
          notes?: string | null
          scheduled_at?: string
          status?: string
          student_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          due_date: string
          id: string
          paid_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          due_date: string
          id?: string
          paid_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string
          id?: string
          paid_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          current_phase: number
          current_week: number
          full_name: string
          goals: string | null
          id: string
          level: number
          mentor_id: string | null
          phone: string | null
          status: string
          streak: number
          streak_freeze_resets_at: string | null
          streak_freeze_used_at: string | null
          streak_freezes_remaining: number
          subscription_plan: string
          subscription_status: string
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_phase?: number
          current_week?: number
          full_name?: string
          goals?: string | null
          id?: string
          level?: number
          mentor_id?: string | null
          phone?: string | null
          status?: string
          streak?: number
          streak_freeze_resets_at?: string | null
          streak_freeze_used_at?: string | null
          streak_freezes_remaining?: number
          subscription_plan?: string
          subscription_status?: string
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_phase?: number
          current_week?: number
          full_name?: string
          goals?: string | null
          id?: string
          level?: number
          mentor_id?: string | null
          phone?: string | null
          status?: string
          streak?: number
          streak_freeze_resets_at?: string | null
          streak_freeze_used_at?: string | null
          streak_freezes_remaining?: number
          subscription_plan?: string
          subscription_status?: string
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      resource_completions: {
        Row: {
          completed_at: string
          id: string
          resource_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          resource_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          resource_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_completions_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          content_type: string
          content_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          phase_required: number
          title: string
        }
        Insert: {
          content_type?: string
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          phase_required?: number
          title: string
        }
        Update: {
          content_type?: string
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          phase_required?: number
          title?: string
        }
        Relationships: []
      }
      student_tasks: {
        Row: {
          created_at: string
          id: string
          proof_image_url: string | null
          reviewed_at: string | null
          reviewer_notes: string | null
          status: string
          submitted_at: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          proof_image_url?: string | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string
          submitted_at?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          proof_image_url?: string | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string
          submitted_at?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          lemon_squeezy_customer_id: string | null
          lemon_squeezy_id: string | null
          plan: string
          status: string
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          lemon_squeezy_customer_id?: string | null
          lemon_squeezy_id?: string | null
          plan?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          lemon_squeezy_customer_id?: string | null
          lemon_squeezy_id?: string | null
          plan?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          phase: number
          title: string
          week: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          phase?: number
          title: string
          week?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          phase?: number
          title?: string
          week?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_xp: {
        Args: {
          p_amount: number
          p_description?: string
          p_source?: string
          p_user_id: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "student"],
    },
  },
} as const
