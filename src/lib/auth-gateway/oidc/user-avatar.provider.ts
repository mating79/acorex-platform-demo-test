import { RootConfig } from '@acorex-platform/module-security-management-server/contracts';
import { AXMSecurityManagementUsersEntityModel } from '@acorex-platform/module-security-management-server/contracts';
import { AXPEntityService } from '@acorex-platform/framework-client/layout/entity';
import { AXPUserAvatarData, AXPUserAvatarProvider } from '@acorex-platform/framework-client/layout/components';
import { AXPSessionService } from '@acorex-platform/framework-client/auth';
import { inject } from '@angular/core';

//#region ---- Helpers ----

function normalizeAvatarRef(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'null') {
    return null;
  }
  return trimmed;
}

//#endregion

//#region ---- User avatar provider ----

/**
 * Resolves avatar display data from SecurityManagement.User.avatar.
 * Person.image is kept in sync on the server; clients do not query Person for avatars.
 */
export class AXCApiUserAvatarProvider implements AXPUserAvatarProvider {
  private readonly entityService = inject(AXPEntityService);
  private readonly sessionService = inject(AXPSessionService);

  private userService = this.entityService
    .withEntity(RootConfig.module.name, RootConfig.entities.users.name)
    .data<string, AXMSecurityManagementUsersEntityModel>();

  async provide(userId: string): Promise<AXPUserAvatarData> {
    if (userId.startsWith('assist-')) {
      const { firstName, lastName } = this.splitDisplayName('AI Assistant');
      return {
        id: userId,
        username: '',
        firstName,
        lastName,
        status: 'online',
      };
    }

    const currentUser = this.sessionService.user;
    const isCurrentUser = currentUser?.id === userId;

    // Self: SignIn/Refresh always carry avatar (string | null) — no entity round-trip.
    if (isCurrentUser && currentUser && currentUser.avatar !== undefined) {
      return this.fromSessionUser(currentUser);
    }

    if (!this.sessionService.isReadyForAppScopedApi) {
      if (isCurrentUser && currentUser) {
        return this.fromSessionUser(currentUser);
      }
      throw new Error(`User not found for ${userId}`);
    }

    try {
      const user = await this.userService.byKey(userId);
      if (user) {
        const displayName = user.displayName ?? (isCurrentUser ? currentUser?.title || currentUser?.name : '') ?? '';
        const { firstName, lastName } = this.splitDisplayName(displayName);
        const avatarUrl = normalizeAvatarRef(user.avatar);

        return {
          id: user.id,
          username: user.username ?? (isCurrentUser ? currentUser?.name : '') ?? '',
          firstName,
          lastName,
          status: 'offline',
          ...(avatarUrl ? { avatarUrl } : {}),
        };
      }
    } catch (error) {
      console.debug('Failed to load user from entity service', error);
    }

    if (isCurrentUser && currentUser) {
      return this.fromSessionUser(currentUser);
    }

    throw new Error(`User not found for ${userId}`);
  }

  private fromSessionUser(currentUser: NonNullable<AXPSessionService['user']>): AXPUserAvatarData {
    const sessionAvatar = normalizeAvatarRef(currentUser.avatar);
    const { firstName, lastName } = this.splitDisplayName(currentUser.title || currentUser.name || '');

    return {
      id: currentUser.id,
      username: currentUser.name || '',
      firstName,
      lastName,
      status: 'offline',
      ...(sessionAvatar ? { avatarUrl: sessionAvatar } : {}),
    };
  }

  private splitDisplayName(displayName: string): { firstName: string; lastName: string } {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] ?? '',
      lastName: parts.slice(1).join(' '),
    };
  }
}

//#endregion
