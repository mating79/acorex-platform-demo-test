import { runtimeCommandPayloadData } from '@acorex-platform/framework-shared/core';
import { AXMAuthConfigs, AXM_AUTH_CONFIG_TOKEN } from '@acorex-platform/module-auth-client';
import {
  AXPApplication,
  AXPAuthStrategy,
  AXPBaseCredentials,
  type AXPPlatformOAuthDiscoveryDocument,
  AXPSessionContext,
  AXPSessionData,
  AXPSessionService,
  AXPSignInResult,
  AXPTenant,
  AXPUser,
  fetchPlatformOAuthDiscoveryDocument,
  JwtUtil,
  PkceUtil,
  resolvePlatformOAuthAuthorizeEndpoint,
  resolvePlatformOAuthClientConfig,
  resolvePlatformOAuthIssuer,
  resolvePlatformOAuthTokenEndpoint,
  TimeUtil,
} from '@acorex-platform/framework-client/auth';
import { AXPCommandService } from '@acorex-platform/framework-client/runtime';
import { AUTH_LOGOUT_DEFAULT, AUTH_REFRESH_DEFAULT } from '@acorex-platform/framework-shared/runtime';
import { Injectable, inject } from '@angular/core';

//#region ---- OIDC platform auth strategy ----

@Injectable()
export class AXCAPIOidcStrategy extends AXPAuthStrategy {
  private readonly authConfigs: AXMAuthConfigs = inject(AXM_AUTH_CONFIG_TOKEN);
  private readonly commandService = inject(AXPCommandService);
  private readonly sessionService = inject(AXPSessionService);
  private discoveryDocument: AXPPlatformOAuthDiscoveryDocument | null = null;

  private resolveIssuer(): string {
    return resolvePlatformOAuthIssuer(this.authConfigs.baseUrl);
  }

  private resolveClientConfig() {
    return resolvePlatformOAuthClientConfig(this.authConfigs.authConfig);
  }

  private async ensureDiscoveryLoaded(): Promise<void> {
    if (this.discoveryDocument) {
      return;
    }

    this.discoveryDocument = await fetchPlatformOAuthDiscoveryDocument(this.resolveIssuer());

    const oidcJson = localStorage.getItem(AXPSessionService.SESSION_KEY);
    if (!oidcJson) {
      return;
    }

    const authData = JSON.parse(oidcJson) as AXPSessionData;
    if (!authData) {
      return;
    }

    this.sessionService.setSession(authData);
    if (authData.expiresIn && new Date(authData.expiresIn) < new Date()) {
      if (authData.expiresIn) {
        await this.sessionService.refreshToken();
      } else {
        await this.signout();
      }
    }
  }

  async signin(credentials: AXPBaseCredentials): Promise<AXPSignInResult | undefined> {
    if (credentials.strategy === 'oidc' && (credentials as AXPUserPassCredentials).username) {
      await this.handleOidcPasswordSignin(credentials as AXPUserPassCredentials);
      await new Promise(() => {});
    }
    throw new Error(`Authentication method or credentials not supported: ${credentials.strategy}`);
  }

  private async handleOidcPasswordSignin(credentials: AXPUserPassCredentials): Promise<undefined> {
    await this.ensureDiscoveryLoaded();

    const baseUrl = this.authConfigs.baseUrl;
    if (!baseUrl) {
      throw new Error('baseUrl is missing. Please check your environment configuration.');
    }

    const loginRes = await fetch(`${baseUrl}/auth/manual-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: credentials.username, password: credentials.password }),
      credentials: 'include',
    });

    if (!loginRes.ok) {
      let errorText = 'Login failed';
      try {
        const errorJson = await loginRes.json();
        if (errorJson?.error?.description) {
          errorText = errorJson.error.description;
        }
      } catch {
        try {
          const text = await loginRes.text();
          if (text) {
            errorText = text;
          }
        } catch {
          // keep default message
        }
      }
      throw new Error(errorText);
    }

    const contentType = loginRes.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      await loginRes.json();
    } else {
      await loginRes.text();
    }

    await this.updateToken({});
  }

  override async updateToken(params: { [key: string]: unknown }): Promise<AXPSignInResult | void> {
    try {
      await this.ensureDiscoveryLoaded();

      const issuer = this.resolveIssuer();
      const { clientId, redirectUri, scope } = this.resolveClientConfig();

      if (params['code']) {
        const code = String(params['code']);
        const resolvedRedirectUri = String(params['redirectUri'] || redirectUri);
        const resolvedClientId = String(params['clientId'] || clientId);
        const tokenEndpoint = resolvePlatformOAuthTokenEndpoint(issuer, this.discoveryDocument);

        const codeVerifier = localStorage.getItem('pkce_code_verifier');
        localStorage.removeItem('pkce_code_verifier');
        if (!codeVerifier) {
          throw new Error('Code verifier not found. Please try signing in again.');
        }

        const body = new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: resolvedClientId,
          code_verifier: codeVerifier,
          code,
          redirect_uri: resolvedRedirectUri,
        });

        const response = await fetch(tokenEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        });

        if (!response.ok) {
          throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
        }

        const tokenData = await response.json();
        if (!tokenData) {
          throw new Error('Token data not found');
        }

        const payload = JwtUtil.parseJwt(tokenData.id_token);
        if (!payload) {
          throw new Error('Payload not found');
        }

        const user = {
          id: payload['sub'] || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '',
          title: payload['name'] || payload['email'] || '',
          name: payload['name'] || payload['email'] || '',
          avatar: payload['picture'] || '',
        } as AXPUser;

        const tenant =
          payload['tenantid'] || payload['tenant']
            ? {
                id: payload['tenantid'] || payload['tenant'] || '',
                name: payload['tenantname'] || '',
                title: payload['tenanttitle'] || '',
              }
            : undefined;

        const application =
          payload['applicationid'] || payload['application']
            ? {
                id: payload['applicationid'] || payload['application'] || '',
                name: payload['applicationname'] || '',
                title: payload['applicationtitle'] || '',
              }
            : undefined;

        return {
          succeed: true,
          data: {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            idToken: tokenData.id_token,
            expiresIn: TimeUtil.calculateExpireInDate(tokenData.expires_in || 0),
            user,
            tenant,
            application,
          },
        };
      }

      const tenantId = (params['tenantId'] ?? (params['tenant'] as { id?: string } | undefined)?.id ?? null) as
        | string
        | null;
      const applicationId = (params['applicationId'] ??
        (params['application'] as { id?: string } | undefined)?.id ??
        null) as string | null;
      const resolvedRedirectUri = String(params['redirectUri'] || redirectUri);
      const resolvedScope = String(params['scope'] || scope);

      const codeVerifier = PkceUtil.generateRandomString(128);
      localStorage.setItem('pkce_code_verifier', codeVerifier);
      const codeChallenge = await PkceUtil.generateCodeChallenge(codeVerifier);

      const authorizeEndpoint = resolvePlatformOAuthAuthorizeEndpoint(issuer, this.discoveryDocument);
      const state = Math.random().toString(36).substring(2);

      const queryParams = [
        `response_type=code`,
        `client_id=${encodeURIComponent(clientId)}`,
        `redirect_uri=${encodeURIComponent(resolvedRedirectUri)}`,
        `scope=${encodeURIComponent(resolvedScope)}`,
        `state=${encodeURIComponent(state)}`,
        tenantId ? `tenant_id=${encodeURIComponent(tenantId)}` : null,
        applicationId ? `application_id=${encodeURIComponent(applicationId)}` : null,
        `code_challenge=${encodeURIComponent(codeChallenge)}`,
        `code_challenge_method=S256`,
      ]
        .filter(Boolean)
        .join('&');

      window.location.href = `${authorizeEndpoint}?${queryParams}`;
      await new Promise(() => {});
    } catch (error) {
      this.handleError(error);
    }
  }

  async signout(): Promise<void> {
    localStorage.removeItem('pkce_code_verifier');
    localStorage.removeItem('oauth_provider');

    try {
      await this.commandService.execute(AUTH_LOGOUT_DEFAULT, {});
    } catch {
      // Ignore logout network errors; client session is cleared regardless.
    }

    window.location.href = '/';
  }

  async refreshToken(context: AXPSessionContext): Promise<AXPSignInResult> {
    try {
      if (!this.sessionService.hasSessionCredentials()) {
        return { succeed: false };
      }

      const result = await this.commandService.execute<unknown, {
        accessToken?: string;
        refreshToken?: string;
        expiresIn?: string;
        user: AXPUser;
        tenant?: AXPTenant | null;
        application?: AXPApplication | null;
      }>(AUTH_REFRESH_DEFAULT, {});

      const data = runtimeCommandPayloadData(result);
      if (!data?.user) {
        return { succeed: false };
      }

      const sessionData: AXPSessionData = {
        strategy: 'oidc',
        expiresIn: data.expiresIn ?? null,
        user: data.user,
        tenant: data.tenant ?? context.tenant ?? null,
        application: data.application ?? context.application ?? null,
        cookieSession: true,
      };

      return {
        succeed: true,
        data: {
          ...sessionData,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: sessionData.user as AXPUser,
        },
      };
    } catch (error) {
      console.error('Error refreshing token', error);
      return { succeed: false };
    }
  }

  private handleError(error: unknown): never {
    console.error('Authentication error:', error);
    throw error;
  }

  get name(): string {
    return 'oidc';
  }
}

//#endregion

export interface AXPUserPassCredentials extends AXPBaseCredentials {
  username: string;
  password: string;
}

export interface AXPOAuthExternalCredentials extends AXPBaseCredentials {
  strategy: string;
  accessToken: string;
  refreshToken: string;
  idToken: string;
  user: string;
  expiresIn: string;
  provider: string;
}

export interface IAuthenticationDataModel {
  access_token: string;
  applicationid: string;
  applicationname: string;
  applicationtitle: string;
  editionid: string;
  editionname: string;
  editiontitle: string;
  id_token: string;
  refresh_token: string;
  scope: string;
  tenantid: string;
  tenantname: string;
  tenanttitle: string;
  token_type: string;
  expires_in?: number;
  sub?: string;
  fullname?: string;
  picture?: string;
}
