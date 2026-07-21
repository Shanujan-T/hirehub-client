import type { Community } from "@/types";

/** Merge list `is_member` flags with the user's joined community ids. */
export function applyCommunityMembership(
  communities: Community[],
  joined: Community[] | number[],
): Community[] {
  const memberIds = new Set(
    joined.map((item) => (typeof item === "number" ? item : item.id)),
  );

  return communities.map((community) => ({
    ...community,
    is_member: Boolean(community.is_member) || memberIds.has(community.id),
  }));
}

export function applyCommunityMembershipToOne(
  community: Community,
  joined: Community[] | number[],
): Community {
  return applyCommunityMembership([community], joined)[0];
}
