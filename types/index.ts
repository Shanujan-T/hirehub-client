import type {
  APPLICATION_STATUSES,
  COMMUNITY_ROLES,
  COMMUNITY_TYPES,
  EDUCATION_LEVELS,
  EXPERIENCE_LEVELS,
  JOB_STATUSES,
  JOB_TYPES,
  MEDIA_TYPES,
  MENTORSHIP_STATUSES,
  POST_TYPES,
  REACTION_TYPES,
  REFERRAL_STATUSES,
  REPORT_STATUSES,
  REPORT_TARGET_TYPES,
  SKILL_LEVELS,
  NOTIFY_VIA_OPTIONS,
  USER_ROLES,
} from "@/lib/constants";

// ── Primitive unions ─────────────────────────────────────────────────────────

export type UserRole = (typeof USER_ROLES)[number];
export type NotifyVia = (typeof NOTIFY_VIA_OPTIONS)[number];
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];
export type JobType = (typeof JOB_TYPES)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type JobStatus = (typeof JOB_STATUSES)[number];
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export type SkillLevel = (typeof SKILL_LEVELS)[number];
export type PostType = (typeof POST_TYPES)[number];
export type ReactionType = (typeof REACTION_TYPES)[number];
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];
export type ReportStatus = (typeof REPORT_STATUSES)[number];
export type MentorshipStatus = (typeof MENTORSHIP_STATUSES)[number];
export type ReferralStatus = (typeof REFERRAL_STATUSES)[number];
export type CommunityType = (typeof COMMUNITY_TYPES)[number];
export type CommunityRole = (typeof COMMUNITY_ROLES)[number];
export type MediaType = (typeof MEDIA_TYPES)[number] | string;

// ── Core entities ────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  role: UserRole;
  full_name: string;
  bio: string | null;
  location: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  notify_via: NotifyVia | null;
  education_level: EducationLevel | null;
  resume_url: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string | null;
  skills?: UserSkill[];
  interests?: UserInterest[];
}

export interface Company {
  id: number;
  owner_id: number;
  name: string;
  industry: string | null;
  description: string | null;
  website: string | null;
  location: string | null;
  logo_url: string | null;
  founded_year: number | null;
  company_size: string | null;
  is_verified: boolean;
  created_at: string | null;
  open_jobs_count?: number;
  avg_response_time_days?: number | null;
  jobs?: Job[];
}

export interface Skill {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  created_at: string | null;
}

export interface UserSkill {
  id: number;
  user_id: number;
  skill_id: number;
  level: SkillLevel;
  verified?: boolean;
  verified_by?: number | null;
  skill: Skill | null;
  created_at: string | null;
}

export interface Interest {
  id: number;
  name: string;
  category: string | null;
  created_at: string | null;
}

export interface UserInterest {
  id: number;
  user_id: number;
  interest_id: number;
  interest: Interest | null;
  created_at: string | null;
}

export interface JobSkill {
  id: number;
  job_id: number;
  skill_id: number;
  skill: Skill | null;
  created_at: string | null;
}

export interface Job {
  id: number;
  company_id: number;
  posted_by: number;
  title: string;
  description: string | null;
  category: string | null;
  job_type: JobType;
  experience_level: ExperienceLevel;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  distance_km?: number;
  deadline: string | null;
  status: JobStatus;
  image_url: string | null;
  created_at: string | null;
  company?: Company;
  skills?: JobSkill[];
  skill_ids?: number[];
  match_score?: number;
  matched_skills?: string[];
}

export interface ApplicationStatusLog {
  id: number;
  application_id: number;
  old_status: ApplicationStatus | string | null;
  new_status: ApplicationStatus | string;
  changed_by: number;
  changed_by_name?: string | null;
  created_at: string | null;
}

export type InterviewStatus = "proposed" | "confirmed" | "cancelled";

export interface Interview {
  id: number;
  application_id: number;
  proposed_by: number;
  slots: string[];
  selected_slot: string | null;
  status: InterviewStatus;
  created_at: string | null;
}

export interface Application {
  id: number;
  job_id: number;
  seeker_id: number;
  cover_letter: string | null;
  resume_url: string | null;
  status: ApplicationStatus;
  rejection_reason?: string | null;
  interview?: Interview | null;
  created_at: string | null;
  job?: Job;
  seeker?: User;
}

export interface SavedJob {
  id: number;
  seeker_id: number;
  job_id: number;
  job: Job | null;
  created_at: string | null;
}

export interface SavedSearch {
  id: number;
  user_id: number;
  name: string | null;
  keywords: string | null;
  category: string | null;
  location: string | null;
  job_type: JobType | null;
  min_salary: number | null;
  filters?: SavedSearchFilters;
  created_at: string | null;
}

export interface SavedSearchFilters {
  keyword?: string | null;
  location?: string | null;
  category?: string | null;
  job_type?: JobType | null;
  min_salary?: number | null;
}

// ── Social / content ─────────────────────────────────────────────────────────

export interface PostAuthorSummary {
  id: number;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
}

export interface PostMedia {
  id: number;
  post_id: number;
  media_type: string;
  url: string;
  title: string | null;
  created_at: string | null;
}

export interface Hashtag {
  id: number;
  name: string;
  created_at: string | null;
}

export interface MentionedUserSummary {
  id: number;
  full_name: string;
  avatar_url: string | null;
}

export interface PostMention {
  id: number;
  post_id: number | null;
  comment_id: number | null;
  mentioned_user_id: number;
  mentioned_user: MentionedUserSummary | null;
  created_at: string | null;
}

export interface Post {
  id: number;
  author_id: number;
  community_id: number | null;
  title: string;
  body: string;
  type: PostType;
  job_id: number | null;
  link_url: string | null;
  image_url: string | null;
  created_at: string | null;
  author?: PostAuthorSummary;
  comments?: Comment[];
  media?: PostMedia[];
  hashtags?: Hashtag[];
  mentions?: PostMention[];
  reaction_count?: number;
  comment_count?: number;
  reactions_summary?: Record<string, number>;
}

export interface CommentAuthorSummary {
  id: number;
  full_name: string;
  avatar_url: string | null;
}

export interface Comment {
  id: number;
  post_id: number;
  author_id: number;
  parent_id: number | null;
  body: string;
  author: CommentAuthorSummary | null;
  mentions: PostMention[];
  created_at: string | null;
  replies?: Comment[];
}

export interface PostReaction {
  id: number;
  post_id: number;
  user_id: number;
  reaction_type: ReactionType;
  user: MentionedUserSummary | null;
  created_at: string | null;
}

export interface PostBookmark {
  id: number;
  user_id: number;
  post_id: number;
  post: Post | null;
  created_at: string | null;
}

export interface Report {
  id: number;
  reporter_id: number;
  target_type: ReportTargetType;
  target_id: number;
  reason: string;
  details: string | null;
  status: ReportStatus;
  resolved_by: number | null;
  created_at: string | null;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  message: string;
  link_url: string | null;
  is_read: boolean;
  created_at: string | null;
}

// ── Mentorship ───────────────────────────────────────────────────────────────

export interface MentorProfile {
  id: number;
  user_id: number;
  community_id: number | null;
  headline: string | null;
  expertise_areas: string[];
  years_experience: number | null;
  available_for: string[];
  max_mentees: number;
  is_available: boolean;
  bio: string | null;
  user: {
    id: number;
    full_name: string;
    avatar_url: string | null;
    role: UserRole;
    location: string | null;
  } | null;
  created_at: string | null;
}

export interface MentorshipSession {
  id: number;
  mentorship_id: number;
  topic: string;
  focus_area: string | null;
  scheduled_at: string | null;
  notes: string | null;
  status: string;
  created_at: string | null;
}

export interface Mentorship {
  id: number;
  mentor_id: number;
  mentee_id: number;
  community_id: number | null;
  focus_area: string | null;
  status: MentorshipStatus;
  message: string | null;
  mentor: User | null;
  mentee: User | null;
  created_at: string | null;
  sessions?: MentorshipSession[];
}

// ── Messaging ──────────────────────────────────────────────────────────────────

export interface ConversationParticipantSummary {
  id: number;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
}

export interface Conversation {
  id: number;
  application_id: number;
  employer_id: number;
  seeker_id: number;
  created_at: string | null;
  application?: Application | null;
  other_party?: ConversationParticipantSummary | null;
  job_title?: string | null;
  last_message?: Message | null;
  unread_count?: number;
}

export interface ConversationDetail {
  conversation: Conversation;
  messages: Message[];
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string;
  read_at: string | null;
  created_at: string | null;
}

export interface SendMessagePayload {
  body: string;
}

export interface ReportDetail {
  report: Report;
  conversation?: Conversation | null;
  messages?: Message[];
  reported_message?: Message | null;
}

// ── Communities ────────────────────────────────────────────────────────────────

export interface Community {
  id: number;
  name: string;
  slug: string;
  type: CommunityType;
  description: string | null;
  rules: string | null;
  cover_image_url: string | null;
  avatar_url: string | null;
  location: string | null;
  industry: string | null;
  is_public: boolean;
  created_by: number;
  created_at: string | null;
  member_count?: number;
  is_member?: boolean;
}

export interface CommunityMember {
  id: number;
  community_id: number;
  user_id: number;
  role: CommunityRole;
  user: {
    id: number;
    full_name: string;
    avatar_url: string | null;
    role: UserRole;
  } | null;
  joined_at: string | null;
}

export interface CommunityAnnouncement {
  id: number;
  community_id: number;
  author_id: number;
  title: string;
  body: string;
  is_pinned: boolean;
  author: CommentAuthorSummary | null;
  created_at: string | null;
}

// ── Referrals ──────────────────────────────────────────────────────────────────

export interface JobReferral {
  id: number;
  referrer_id: number;
  candidate_id: number | null;
  job_id: number | null;
  company_id: number | null;
  community_id: number | null;
  referral_type: string;
  candidate_name: string | null;
  candidate_email: string | null;
  candidate_resume_url: string | null;
  vacancy_title: string | null;
  vacancy_description: string | null;
  message: string | null;
  status: ReferralStatus;
  is_internal_vacancy: boolean;
  referrer: MentionedUserSummary | null;
  candidate: User | null;
  created_at: string | null;
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

export interface OnboardingChecklistItem {
  key: string;
  label: string;
  href: string;
  completed: boolean;
}

export interface SeekerStats {
  applications_sent: number;
  jobs_saved: number;
  communities_joined: number;
}

export interface ActivityItem {
  id: number;
  type: string;
  description: string;
  application_id?: number;
  created_at: string | null;
}

export interface SeekerDashboard {
  role: "seeker";
  applications_by_status: Record<string, number>;
  applications: Application[];
  recommended_jobs: Job[];
  profile_completion_score?: number;
  badges?: string[];
  onboarding_checklist?: OnboardingChecklistItem[];
}

export interface SalaryInsight {
  role: string | null;
  location: string | null;
  count: number;
  avg_salary_min: number | null;
  avg_salary_max: number | null;
}

export interface SkillQuizQuestion {
  id: number;
  skill_id: number;
  question: string;
  options: string[];
}

export interface QuizSubmitPayload {
  answers: number[];
}

export interface QuizResult {
  message: string;
  score: number;
  passed: boolean;
  pass_threshold: number;
  correct_count: number;
  total_questions: number;
  user_skill: UserSkill;
}

export interface NotificationPreferencesPayload {
  notify_via?: NotifyVia;
  whatsapp_number?: string | null;
}

export interface EmployerDashboard {
  role: "employer";
  jobs_count: number;
  jobs: Job[];
  applicants_by_status: Record<string, number>;
  applications: Application[];
  company: Company | null;
}

export interface AdminAnalytics {
  jobs_by_category: { category: string; count: number }[];
  applications_by_week: { week: string; count: number }[];
  top_skills_in_demand: { skill: string; count: number }[];
  applications_by_status: { status: string; count: number }[];
  total_users: number;
  total_jobs: number;
  total_applications: number;
}

export interface AdminDashboard {
  role: "admin";
  counts: {
    users: number;
    seekers: number;
    employers: number;
    companies: number;
    jobs: number;
    applications: number;
    posts: number;
    open_reports: number;
  };
}

export type DashboardData =
  | SeekerDashboard
  | EmployerDashboard
  | AdminDashboard;

// ── API response wrappers ──────────────────────────────────────────────────────

export interface MessageResponse {
  message: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  access_token: string;
  user: User;
}

export interface ProfileResponse {
  user: User;
}

export interface ImportResult {
  message?: string;
  imported_count?: number;
  created_count?: number;
  created?: number;
  updated_count?: number;
  skipped?: number;
  errors?: string[];
}

export interface PaginatedMeta {
  page?: number;
  per_page?: number;
  total?: number;
}

export interface JobsQueryParams {
  q?: string;
  category?: string;
  location?: string;
  job_type?: JobType;
  experience_level?: ExperienceLevel;
  status?: JobStatus;
  sort?: "recent" | "most_applied";
  limit?: number;
  min_salary?: number;
  page?: number;
  per_page?: number;
}

export interface CandidatesQueryParams {
  q?: string;
  location?: string;
  skill_id?: number;
  education_level?: EducationLevel;
}

export interface MentorsQueryParams {
  q?: string;
  community_id?: number;
  focus_area?: string;
}

export interface CommunitiesQueryParams {
  q?: string;
  type?: CommunityType;
  location?: string;
}

export interface PostsQueryParams {
  q?: string;
  type?: PostType;
  community_id?: number;
  author_id?: number;
}

export interface ReferralsQueryParams {
  community_id?: number;
  status?: ReferralStatus;
}

export interface ReportsQueryParams {
  status?: ReportStatus;
  target_type?: ReportTargetType;
}

export interface NotificationsQueryParams {
  unread_only?: boolean;
}

export interface ResolveReportPayload {
  status: ReportStatus;
  action_taken?: string;
}

export interface CreateReportPayload {
  target_type: ReportTargetType;
  target_id: number;
  reason: string;
  details?: string;
}

export interface CreateJobPayload {
  title: string;
  description?: string;
  category?: string;
  job_type?: JobType;
  experience_level?: ExperienceLevel;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  deadline?: string;
  skill_ids?: number[];
  image?: File | null;
  removeImage?: boolean;
}

export interface UpdateJobPayload extends Partial<CreateJobPayload> {
  status?: JobStatus;
}

export interface CreateApplicationPayload {
  job_id: number;
  cover_letter?: string;
  resume_url?: string;
}

export interface CreateCompanyPayload {
  name: string;
  industry?: string;
  description?: string;
  website?: string;
  location?: string;
  logo_url?: string;
  founded_year?: number | null;
  company_size?: string;
}

export interface UpdateProfilePayload {
  full_name?: string;
  bio?: string;
  location?: string;
  phone?: string;
  education_level?: EducationLevel | null;
  resume_url?: string;
  avatar_url?: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  location?: string;
  role?: UserRole;
  account_type?: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password?: string;
  new_password?: string;
}

export interface CreatePostPayload {
  title: string;
  body: string;
  type?: PostType;
  community_id?: number;
  job_id?: number;
  link_url?: string;
  hashtags?: string[];
  media?: Array<{ media_type: string; url: string; title?: string }>;
  image?: File | null;
}

export interface CreateCommentPayload {
  body: string;
  parent_id?: number;
  mentioned_user_ids?: number[];
}

export interface CreateMentorshipPayload {
  mentor_id: number;
  message?: string;
  focus_area?: string;
  community_id?: number;
}

export interface UpsertMentorProfilePayload {
  headline?: string;
  expertise_areas?: string[];
  years_experience?: number;
  available_for?: string[];
  max_mentees?: number;
  is_available?: boolean;
  bio?: string;
  community_id?: number;
}

export interface CreateSessionPayload {
  topic: string;
  focus_area?: string;
  scheduled_at?: string;
  notes?: string;
}

export interface CreateCommunityPayload {
  name: string;
  type?: CommunityType;
  description?: string;
  rules?: string;
  cover_image_url?: string;
  avatar_url?: string;
  location?: string;
  industry?: string;
  is_public?: boolean;
}

export interface CreateReferralPayload {
  candidate_id?: number;
  job_id?: number;
  company_id?: number;
  community_id?: number;
  referral_type?: string;
  candidate_name?: string;
  candidate_email?: string;
  candidate_resume_url?: string;
  vacancy_title?: string;
  vacancy_description?: string;
  message?: string;
  is_internal_vacancy?: boolean;
}

export interface CreateSavedSearchPayload {
  name?: string;
  keywords?: string;
  category?: string;
  location?: string;
  job_type?: JobType;
  min_salary?: number;
  filters?: SavedSearchFilters;
}

export interface CreateUserSkillPayload {
  skill_id: number;
  level?: SkillLevel;
}

export interface CreateUserInterestPayload {
  interest_id: number;
}

export interface CreateSkillPayload {
  name: string;
  category?: string;
  description?: string;
}

export interface CreateInterestPayload {
  name: string;
  category?: string;
}

export interface UpdateMemberRolePayload {
  role: CommunityRole;
}

export interface UpdateReferralStatusPayload {
  status: ReferralStatus;
}

export interface AddReactionPayload {
  reaction_type: ReactionType;
}

export interface PatchJobStatusPayload {
  status: JobStatus;
}

export interface PatchUserStatusPayload {
  is_active: boolean;
}

export interface VerifyCompanyPayload {
  is_verified: boolean;
}
