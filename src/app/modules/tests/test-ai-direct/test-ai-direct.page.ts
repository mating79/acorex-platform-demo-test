//#region ----- Imports -----

import { AXButtonModule } from '@acorex/components/button';
import { AXDecoratorModule } from '@acorex/components/decorators';
import { AXLoadingModule } from '@acorex/components/loading';
import { AXTextAreaModule } from '@acorex/components/text-area';
import { AXTranslationModule } from '@acorex/core/translation';
import { extractRequestErrorInfo } from '@acorex-platform/framework-client/common';
import { AXPThemeLayoutBlockComponent } from '@acorex-platform/framework-client/layout/components';
import {
  AXPPageLayoutBase,
  AXPPageLayoutBaseComponent,
  AXPPageLayoutComponent,
} from '@acorex-platform/framework-client/layout/views';
import { AXPActionMenuItem, AXPExecuteCommand, resolveMultiLanguageString } from '@acorex-platform/framework-shared/core';
import {
  AXPAiManagerService,
  AXPAiPlatformRuntimeContextBuilder,
  axpAiChatMessageGetText,
  axpAiChatTextMessage,
  type AXPAiChatMessage,
  type AXPAiEngineRunEvent,
} from '@acorex-platform/module-ai-management-client';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

//#endregion

//#region ----- Types -----

type TestAiDirectDisplayMessage = {
  role: 'user' | 'assistant';
  text: string;
};

//#endregion

//#region ----- Component -----

@Component({
  selector: 'demo-test-ai-direct-page',
  standalone: true,
  templateUrl: './test-ai-direct.page.html',
  styleUrl: './test-ai-direct.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: AXPPageLayoutBase,
      useExisting: TestAiDirectPageComponent,
    },
  ],
  host: { class: 'demo-test-ai-direct-page' },
  imports: [
    AsyncPipe,
    FormsModule,
    AXButtonModule,
    AXDecoratorModule,
    AXLoadingModule,
    AXTextAreaModule,
    AXTranslationModule,
    AXPPageLayoutComponent,
    AXPThemeLayoutBlockComponent,
  ],
})
export class TestAiDirectPageComponent extends AXPPageLayoutBaseComponent {
  //#region ----- Services & Dependencies -----

  private readonly aiManager = inject(AXPAiManagerService);
  private readonly runtimeContextBuilder = inject(AXPAiPlatformRuntimeContextBuilder);
  private readonly zone = inject(NgZone);

  //#endregion

  //#region ----- State Signals -----

  protected readonly draft = signal('');
  protected readonly sending = signal(false);
  protected readonly assistLabel = signal('');
  protected readonly lastElapsedMs = signal<number | null>(null);
  protected readonly lastFirstTokenMs = signal<number | null>(null);
  protected readonly lastErrorDetail = signal('');
  protected readonly streamDraft = signal('');

  private readonly engineMessages = signal<AXPAiChatMessage[]>([]);
  private readonly transcriptEl = viewChild<ElementRef<HTMLElement>>('transcript');

  protected readonly displayMessages = computed((): TestAiDirectDisplayMessage[] => {
    const rows: TestAiDirectDisplayMessage[] = [];
    for (const message of this.engineMessages()) {
      if (message.role !== 'user' && message.role !== 'assistant') {
        continue;
      }
      const text = axpAiChatMessageGetText(message).trim();
      if (!text) {
        continue;
      }
      rows.push({ role: message.role, text });
    }
    const draft = this.streamDraft().trim();
    if (this.sending()) {
      rows.push({ role: 'assistant', text: draft });
    }
    return rows;
  });

  protected readonly canSend = computed(() => this.draft().trim().length > 0 && !this.sending());

  //#endregion

  //#region ----- Page metadata -----

  override getPageIcon(): string | null {
    return 'fa-light fa-comments';
  }

  override async getPageTitle(): Promise<string> {
    return this.translateService.translateAsync('@demo-tests:ai-direct.title');
  }

  override async getPageDescription(): Promise<string> {
    const elapsed = this.lastElapsedMs();
    const firstToken = this.lastFirstTokenMs();
    if (elapsed != null && firstToken != null) {
      return this.translateService.translateAsync('@demo-tests:ai-direct.description-with-timing', {
        params: { elapsed: String(elapsed), firstToken: String(firstToken) },
      });
    }
    if (elapsed != null) {
      return this.translateService.translateAsync('@demo-tests:ai-direct.description-with-elapsed', {
        params: { elapsed: String(elapsed) },
      });
    }
    return this.translateService.translateAsync('@demo-tests:ai-direct.description');
  }

  override async getSecondaryMenuItems(): Promise<AXPActionMenuItem[]> {
    return [
      {
        title: await this.translateService.translateAsync('@general:actions.clear.title'),
        icon: 'fa-light fa-eraser',
        command: { name: 'clear' },
      },
    ];
  }

  override async execute(command: AXPExecuteCommand): Promise<void> {
    if (command.name === 'clear') {
      this.clearTranscript();
    }
  }

  //#endregion

  //#region ----- Event Handlers -----

  protected async send(): Promise<void> {
    const text = this.draft().trim();
    if (!text || this.sending()) {
      return;
    }

    this.draft.set('');
    this.lastErrorDetail.set('');
    this.lastElapsedMs.set(null);
    this.lastFirstTokenMs.set(null);
    this.streamDraft.set('');
    this.sending.set(true);
    this.recompute();

    const userMessage = axpAiChatTextMessage('user', text);
    const outgoing = [...this.engineMessages(), userMessage];
    this.engineMessages.set(outgoing);
    this.scrollTranscriptToBottom();

    const startedAt = Date.now();
    let firstTokenMs: number | null = null;
    let streamText = '';

    try {
      const [assist, platformRuntimeContext] = await Promise.all([
        this.aiManager.getEffectiveAssist(),
        this.runtimeContextBuilder.build(),
      ]);
      const locale = this.translateService.getActiveLang();
      const label =
        resolveMultiLanguageString(assist.title, locale).trim() || assist.name?.trim() || assist.id;
      this.assistLabel.set(label);

      const result = await this.aiManager.runEngine({
        assistId: assist.id,
        messages: outgoing,
        platformRuntimeContext,
        onRunEvent: (event) => {
          this.zone.run(() => {
            this.handleRunEvent(event, startedAt, (delta, elapsed) => {
              if (firstTokenMs == null) {
                firstTokenMs = elapsed;
                this.lastFirstTokenMs.set(elapsed);
              }
              streamText += delta;
              this.streamDraft.set(streamText);
              this.scrollTranscriptToBottom();
            });
          });
        },
      });

      const nextMessages = (result.messages ?? []).filter((message) => message.role !== 'system');
      this.engineMessages.set(nextMessages.length > 0 ? nextMessages : outgoing);
      this.lastElapsedMs.set(Date.now() - startedAt);
      if (firstTokenMs != null) {
        this.lastFirstTokenMs.set(firstTokenMs);
      }
    } catch (error) {
      const info = extractRequestErrorInfo(error);
      this.lastErrorDetail.set(info?.message?.trim() || (error instanceof Error ? error.message : ''));
      this.toastService.show({
        color: 'danger',
        title: await this.translateService.translateAsync('@general:messages.generic.error.title'),
        content: await this.translateService.translateAsync('@demo-tests:ai-direct.errors.run-failed'),
      });
    } finally {
      this.sending.set(false);
      this.streamDraft.set('');
      this.recompute();
      this.scrollTranscriptToBottom();
    }
  }

  protected onComposerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void this.send();
    }
  }

  //#endregion

  //#region ----- Transcript -----

  private clearTranscript(): void {
    if (this.sending()) {
      return;
    }
    this.engineMessages.set([]);
    this.streamDraft.set('');
    this.lastElapsedMs.set(null);
    this.lastFirstTokenMs.set(null);
    this.lastErrorDetail.set('');
    this.recompute();
  }

  private handleRunEvent(
    event: AXPAiEngineRunEvent,
    startedAt: number,
    onTextDelta: (delta: string, elapsedMs: number) => void,
  ): void {
    if (event.type === 'assistant_stream_reset') {
      return;
    }
    if (event.type !== 'assistant_stream_delta') {
      return;
    }
    if (event.segment === 'think') {
      return;
    }
    const delta = event.delta ?? '';
    if (!delta) {
      return;
    }
    onTextDelta(delta, Date.now() - startedAt);
  }

  private scrollTranscriptToBottom(): void {
    const el = this.transcriptEl()?.nativeElement;
    if (!el) {
      return;
    }
    el.scrollTop = el.scrollHeight;
  }

  //#endregion
}

//#endregion
