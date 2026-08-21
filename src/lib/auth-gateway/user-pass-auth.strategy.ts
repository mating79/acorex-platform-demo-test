import {
  runtimeCommandPayloadData,
  type AXPMultiLanguageString,
} from '@acorex-platform/framework-shared/core';
import {
  AXPApplication,
  AXPAuthStrategy,
  AXPBaseCredentials,
  AXPSessionContext,
  AXPSessionService,
  AXPSignInResult,
  AXPTenant,
  AXPUser,
  TimeUtil,
} from '@acorex-platform/framework-client/auth';
import { AXPCommandService } from '@acorex-platform/framework-client/runtime';
import { commandMessageTextForError } from '@acorex-platform/framework-client/common';
import {
  AUTH_LOGOUT_DEFAULT,
  AUTH_REFRESH_DEFAULT,
  AUTH_REGISTER_DEFAULT,
  AUTH_SIGN_IN_DEFAULT,
  AUTH_UPDATE_SESSION_DEFAULT,
} from '@acorex-platform/framework-shared/runtime';
import { Injectable, inject } from '@angular/core';

export interface ApiUserPassCredentials extends AXPBaseCredentials {
  username: string;
  password: string;
}

export interface ApiUserPassRegisterCredentials {
  strategy?: string;
  username: string;
  password: string;
  displayName?: string;
}

export class AuthApiError extends Error {
  constructor(
    message: string,
    readonly apiError?: Record<string, unknown>,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

interface AuthTokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string;
  user: AXPUser;
  tenant?: { id: string; name?: string; title?: AXPMultiLanguageString } | null;
  application?: { id: string; name?: string; title?: AXPMultiLanguageString } | null;
}

@Injectable()
export class AXCUserPassStrategyApi extends AXPAuthStrategy {
  private readonly commandService = inject(AXPCommandService);
  private readonly sessionService = inject(AXPSessionService);

  get name(): string {
    return 'user-pass';
  }

  async signin(credentials: ApiUserPassCredentials): Promise<AXPSignInResult> {
    const result = await this.executeAuthCommand<AuthTokenResponseDto>(AUTH_SIGN_IN_DEFAULT, {
      strategy: this.name,
      username: credentials.username,
      password: credentials.password,
    });

    return this.toSignInResult(result);
  }

  async register(credentials: ApiUserPassRegisterCredentials): Promise<AXPSignInResult> {
    const result = await this.executeAuthCommand<AuthTokenResponseDto>(AUTH_REGISTER_DEFAULT, {
      strategy: this.name,
      username: credentials.username,
      password: credentials.password,
      ...(credentials.displayName ? { displayName: credentials.displayName } : {}),
    });

    return this.toSignInResult(result);
  }

  async signout(): Promise<void> {
    try {
      // Refresh token is read from HttpOnly cookie on the server.
      await this.commandService.execute(AUTH_LOGOUT_DEFAULT, {});
    } catch {
      // Ignore logout network errors; client session is cleared regardless.
    }
  }

  async refreshToken(context: AXPSessionContext): Promise<AXPSignInResult> {
    // Refresh token is sent via HttpOnly cookie (credentials: include).
    const result = await this.executeAuthCommand<AuthTokenResponseDto>(AUTH_REFRESH_DEFAULT, {});
    return this.toSignInResult(result, context);
  }

  override async updateToken(params: { [key: string]: any }): Promise<AXPSignInResult> {
    if (!this.sessionService.hasSessionCredentials()) {
      throw new Error('Access session not found');
    }

    const tenant = params['tenant'];
    const application = params['application'];

    const result = await this.executeAuthCommand<AuthTokenResponseDto>(AUTH_UPDATE_SESSION_DEFAULT, {
      tenantId: params['tenantId'] ?? tenant?.id,
      applicationId: params['applicationId'] ?? application?.id,
      tenant,
      application,
    });

    return this.toSignInResult(result, {
      user: (params['user'] as AXPUser) ?? this.sessionService.user,
      tenant: tenant ?? null,
      application: application ?? null,
    });
  }

  private async executeAuthCommand<T>(key: string, input: unknown): Promise<T> {
    const result = await this.commandService.execute<unknown, T>(key, input);

    const data = runtimeCommandPayloadData(result);
    if (data == null) {
      const message = commandMessageTextForError(result?.message?.text) || 'Authentication failed';
      const details =
        result?.message?.details &&
        typeof result.message.details === 'object' &&
        !Array.isArray(result.message.details)
          ? (result.message.details as Record<string, unknown>)
          : {};
      throw new AuthApiError(
        message,
        {
          message,
          ...(typeof result?.message?.code === 'string'
            ? { code: result.message.code, error: result.message.code }
            : {}),
          ...details,
        },
        typeof (details as { status?: unknown }).status === 'number'
          ? (details as { status: number }).status
          : undefined,
      );
    }

    return data;
  }

  private toSignInResult(result: AuthTokenResponseDto, context?: Partial<AXPSessionContext>): AXPSignInResult {
    const tenant = this.mergeTenant(this.mapTenant(result.tenant), context?.tenant ?? null);
    const application = this.mergeApplication(
      this.mapApplication(result.application),
      context?.application ?? null,
    );

    return {
      succeed: true,
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: this.parseExpiresIn(result.expiresIn),
        user: result.user,
        tenant,
        application,
      },
    };
  }

  private mergeTenant(mapped: AXPTenant | null, contextTenant: AXPTenant | null): AXPTenant | null {
    if (!mapped && !contextTenant) {
      return null;
    }

    if (!mapped) {
      return contextTenant;
    }

    if (!contextTenant) {
      return mapped;
    }

    return {
      ...contextTenant,
      ...mapped,
      title: mapped.title && mapped.title !== mapped.id ? mapped.title : contextTenant.title || mapped.title,
      name: mapped.name && mapped.name !== mapped.id ? mapped.name : contextTenant.name || mapped.name,
    };
  }

  private mergeApplication(
    mapped: AXPApplication | null,
    contextApplication: AXPApplication | null,
  ): AXPApplication | null {
    if (!mapped && !contextApplication) {
      return null;
    }

    if (!mapped) {
      return contextApplication;
    }

    if (!contextApplication) {
      return mapped;
    }

    return {
      ...contextApplication,
      ...mapped,
      edition: mapped.edition ?? contextApplication.edition,
      version: mapped.version ?? contextApplication.version,
      logoUrl: mapped.logoUrl ?? contextApplication.logoUrl,
      description: mapped.description ?? contextApplication.description,
    };
  }

  private mapTenant(
    tenant?: { id: string; name?: string; title?: AXPMultiLanguageString } | null,
  ): AXPTenant | null {
    if (!tenant?.id) {
      return null;
    }

    return {
      id: tenant.id,
      name: tenant.name ?? tenant.id,
      title: tenant.title ?? tenant.name ?? tenant.id,
    };
  }

  private mapApplication(
    application?: { id: string; name?: string; title?: AXPMultiLanguageString } | null,
  ): AXPApplication | null {
    if (!application?.id) {
      return null;
    }

    return {
      id: application.id,
      name: application.name ?? application.id,
      title: application.title ?? application.name,
    };
  }

  private parseExpiresIn(expiresIn?: string): string | null {
    if (!expiresIn) {
      return null;
    }

    const match = /^(\d+)([smhd])$/i.exec(expiresIn.trim());
    if (!match) {
      return null;
    }

    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return TimeUtil.calculateExpireInDate(value * multipliers[unit]);
  }
}
