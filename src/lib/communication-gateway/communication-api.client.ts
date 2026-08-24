import { commandMessageTextForError } from '@acorex-platform/framework-client/common';
import { AXPCommandService } from '@acorex-platform/framework-client/runtime';
import { runtimeCommandPayloadData } from '@acorex-platform/framework-shared/core';
import { AXPCommunicationManagementClient } from '@acorex-platform/module-communication-management-client';
import {
  AXMCommunicationManagementServerCommands,
  type CommunicationDeliveryEngagementRequest,
  type CommunicationDeliveryEngagementResult,
  type CommunicationDeliveryMutationResult,
  type CommunicationSendInput,
  type CommunicationSendResult,
  type CommunicationSmtpTestInput,
  type CommunicationSmtpTestResult,
} from '@acorex-platform/module-communication-management-client/contracts';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AXCCommunicationApiClient extends AXPCommunicationManagementClient {
  private readonly commandService = inject(AXPCommandService);

  send(input: CommunicationSendInput): Promise<CommunicationSendResult> {
    return this.execute(AXMCommunicationManagementServerCommands.Send, input);
  }

  markInAppSeen(
    request: CommunicationDeliveryEngagementRequest,
  ): Promise<CommunicationDeliveryEngagementResult> {
    return this.execute(AXMCommunicationManagementServerCommands.InApp.MarkSeen, request);
  }

  markInAppRead(
    request: CommunicationDeliveryEngagementRequest,
  ): Promise<CommunicationDeliveryEngagementResult> {
    return this.execute(AXMCommunicationManagementServerCommands.InApp.MarkRead, request);
  }

  markAllInAppRead(): Promise<CommunicationDeliveryEngagementResult> {
    return this.execute(AXMCommunicationManagementServerCommands.InApp.MarkAllRead, {});
  }

  toggleInAppPin(
    request: CommunicationDeliveryEngagementRequest,
  ): Promise<CommunicationDeliveryMutationResult> {
    return this.execute(AXMCommunicationManagementServerCommands.InApp.TogglePin, request);
  }

  archiveInApp(
    request: CommunicationDeliveryEngagementRequest,
  ): Promise<CommunicationDeliveryMutationResult> {
    return this.execute(AXMCommunicationManagementServerCommands.InApp.Archive, request);
  }

  deleteInApp(
    request: CommunicationDeliveryEngagementRequest,
  ): Promise<CommunicationDeliveryMutationResult> {
    return this.execute(AXMCommunicationManagementServerCommands.InApp.Delete, request);
  }

  testSmtp(input: CommunicationSmtpTestInput): Promise<CommunicationSmtpTestResult> {
    return this.execute(AXMCommunicationManagementServerCommands.Smtp.Test, input);
  }

  private async execute<T>(key: string, input: unknown): Promise<T> {
    const result = await this.commandService.execute<unknown, T>(key, input);
    const data = runtimeCommandPayloadData(result);
    if (data == null) {
      throw new Error(
        commandMessageTextForError(result?.message?.text) || 'Communication request failed',
      );
    }
    return data;
  }
}
