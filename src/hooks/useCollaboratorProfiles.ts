import { useEffect, useState } from "react";
import { buildPositionProfiles, getPositionProfileId } from "../lib/fundacionAccess";
import type { CollaboratorProfile, Evaluation, Position } from "../types";

const STORAGE_KEY = "axen-collaborator-profiles-v1";

function profileOrder(left: CollaboratorProfile, right: CollaboratorProfile) {
  return left.businessUnitId.localeCompare(right.businessUnitId, "es-MX")
    || left.name.localeCompare(right.name, "es-MX");
}

function loadProfiles(): CollaboratorProfile[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) as CollaboratorProfile[] : [];
  } catch {
    return [];
  }
}

function canonicalProfiles(positions: Position[], saved: CollaboratorProfile[] = []) {
  const savedById = new Map(saved.map((profile) => [profile.id, profile]));
  return buildPositionProfiles(positions).map((profile) => {
    const savedProfile = savedById.get(profile.id);
    return {
      ...profile,
      photoUrl: savedProfile?.photoUrl,
      createdAt: savedProfile?.createdAt ?? profile.createdAt,
      updatedAt: savedProfile?.updatedAt ?? profile.updatedAt,
    };
  }).sort(profileOrder);
}

function sameProfileSet(left: CollaboratorProfile[], right: CollaboratorProfile[]) {
  if (left.length !== right.length) return false;
  return left.every((profile, index) => {
    const other = right[index];
    return other
      && profile.id === other.id
      && profile.businessUnitId === other.businessUnitId
      && profile.positionId === other.positionId
      && profile.name === other.name
      && profile.photoUrl === other.photoUrl
      && profile.status === other.status;
  });
}

export function useCollaboratorProfiles(_evaluations: Evaluation[], positions: Position[] = []) {
  const [profiles, setProfiles] = useState<CollaboratorProfile[]>(() => canonicalProfiles(positions, loadProfiles()));

  function persist(next: CollaboratorProfile[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn("No se pudieron guardar los perfiles en este navegador.", error);
    }
  }

  function save(next: CollaboratorProfile[]) {
    const ordered = [...next].sort(profileOrder);
    setProfiles(ordered);
    persist(ordered);
    return ordered;
  }

  useEffect(() => {
    const next = canonicalProfiles(positions, profiles);
    if (!sameProfileSet(profiles, next)) save(next);
    else persist(next);
  }, [positions, profiles]);

  function resolveProfile(input: Pick<CollaboratorProfile, "businessUnitId" | "positionId" | "name"> & { id?: string }) {
    const canonicalId = getPositionProfileId(input.positionId);
    const existing = profiles.find((profile) => profile.id === canonicalId)
      ?? profiles.find((profile) =>
        profile.businessUnitId === input.businessUnitId
        && profile.positionId === input.positionId
      );
    if (existing) return existing;
    const now = new Date().toISOString();
    const profile: CollaboratorProfile = {
      id: canonicalId,
      businessUnitId: input.businessUnitId,
      positionId: input.positionId,
      name: input.name.trim(),
      status: "active",
      createdAt: now,
      updatedAt: now,
    };
    save([...profiles, profile]);
    return profile;
  }

  function updateProfilePhoto(profileId: string, photoUrl: string) {
    const now = new Date().toISOString();
    const next = profiles.map((profile) => profile.id === profileId ? { ...profile, photoUrl, updatedAt: now } : profile);
    save(next);
  }

  return { profiles, resolveProfile, updateProfilePhoto };
}
