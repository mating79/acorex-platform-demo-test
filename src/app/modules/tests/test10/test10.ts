import { AXPFileChooserContext, AXPFileChooserDirective, AXPFileUploaderContext, AXPFileUploaderDirective, buildFileChooserOptions, resolveFileChooserExtension } from '@acorex-platform/framework-client/layout/components';
import { AXPFileStorageService } from '@acorex-platform/framework-client/common';
import { AXPWidgetCoreModule } from '@acorex-platform/framework-client/layout/widget-core';
import { AXPContextChangeEvent, AXPFileListItem, AXPFileStatus, AXPPlatformScope, type AXPWidgetNode } from '@acorex-platform/framework-shared/core';
import { AXButtonModule } from '@acorex/components/button';
import { AXDecoratorModule } from '@acorex/components/decorators';
import { AXLoadingModule } from '@acorex/components/loading';
import { AXTranslationModule } from '@acorex/core/translation';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { defaultTo, isEmpty } from 'lodash-es';

import { canDownloadFileListItem, downloadFileListItem } from './test10-download.util';

//#region ---- Constants ----

const TEST10_MAX_FILE_SIZE = 100 * 1024 * 1024;
const TEST10_ACCEPT = 'image/*';

//#endregion

//#region ---- Test10 component ----

@Component({
  selector: 'test10',
  standalone: true,
  imports: [AXButtonModule, AXDecoratorModule, AXLoadingModule, AXTranslationModule, AXPFileChooserDirective, AXPFileUploaderDirective, AXPWidgetCoreModule, AsyncPipe, UpperCasePipe],
  templateUrl: './test10.html',
  styleUrl: './test10.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestComponent10 {
  //#region ---- Services & Dependencies ----

  private readonly fileStorageService = inject(AXPFileStorageService);

  //#endregion

  //#region ---- State ----

  protected readonly chooserItems = signal<AXPFileListItem[]>([]);
  protected readonly uploaderItems = signal<AXPFileListItem[]>([]);
  protected readonly isChoosing = signal(false);
  protected readonly isUploading = signal(false);
  protected readonly uploadFinished = signal(false);
  protected readonly widgetContext = signal<Record<string, unknown>>({});

  protected readonly fileUploaderWidgetNode = signal<AXPWidgetNode>({
    type: 'attachments',
    path: 'attachments',
    defaultValue: [],
    options: {
      multiple: true,
      accept: TEST10_ACCEPT,
      maxFileSize: TEST10_MAX_FILE_SIZE,
      fileEditable: true,
      showBorder: true,
      showAddItemButton: true,
      enableTitleDescription: false,
    },
  });

  protected readonly canUpload = computed(() => !this.isChoosing() && !this.isUploading() && !isEmpty(this.chooserItems()));

  //#endregion

  //#region ---- Context ----

  protected createChooserContext(): AXPFileChooserContext {
    return {
      options: buildFileChooserOptions({
        multiple: true,
        accept: TEST10_ACCEPT,
        maxFileSize: TEST10_MAX_FILE_SIZE,
        scope: AXPPlatformScope.Tenant,
      }),
      items: this.chooserItems(),
    };
  }

  protected createUploaderContext(): AXPFileUploaderContext {
    return {
      options: {
        multiple: true,
        accept: TEST10_ACCEPT,
        maxFileSize: TEST10_MAX_FILE_SIZE,
        destination: 'storage' as const,
      },
      items: this.uploaderItems(),
      chosen: this.chooserItems(),
    };
  }

  //#endregion

  //#region ---- UI Handlers ----

  protected onChooserItems(items: AXPFileListItem[]): void {
    this.chooserItems.set(items);
    this.uploadFinished.set(false);
  }

  protected onUploaded(items: AXPFileListItem[]): void {
    this.uploaderItems.set(items);
    this.uploadFinished.set(true);
  }

  protected onWidgetContextChanged(event: AXPContextChangeEvent): void {
    this.widgetContext.set(event.data);
  }

  protected trackChooserItem(item: AXPFileListItem): string {
    return `${item.id ?? ''}-${item.name}-${item.size ?? 0}`;
  }

  protected canDownloadItem(item: AXPFileListItem): boolean {
    return canDownloadFileListItem(item);
  }

  protected async downloadItem(item: AXPFileListItem): Promise<void> {
    await downloadFileListItem(item, this.fileStorageService);
  }

  //#endregion

  //#region ---- Display helpers ----

  private static readonly IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp']);
  private static readonly DOCUMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'txt', 'rtf', 'md']);
  private static readonly ARCHIVE_EXTENSIONS = new Set(['zip', 'rar', '7z', 'tar', 'gz']);

  protected formatFileSize(bytes: number | undefined): string {
    const value = bytes ?? 0;
    if (value < 1024) {
      return `${value} B`;
    }
    if (value < 1024 * 1024) {
      return `${(value / 1024).toFixed(1)} KB`;
    }
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected extensionFromName(name: string): string {
    return resolveFileChooserExtension(name);
  }

  protected fileIcon(extension: string): string {
    if (TestComponent10.IMAGE_EXTENSIONS.has(extension)) {
      return 'fa-light fa-file-image';
    }
    if (TestComponent10.DOCUMENT_EXTENSIONS.has(extension)) {
      return 'fa-light fa-file-lines';
    }
    if (TestComponent10.ARCHIVE_EXTENSIONS.has(extension)) {
      return 'fa-light fa-file-zipper';
    }
    return 'fa-light fa-file';
  }

  protected fileIconClass(extension: string): string {
    if (TestComponent10.IMAGE_EXTENSIONS.has(extension)) {
      return '__file-icon __file-icon--image';
    }
    if (TestComponent10.DOCUMENT_EXTENSIONS.has(extension)) {
      return '__file-icon __file-icon--document';
    }
    if (TestComponent10.ARCHIVE_EXTENSIONS.has(extension)) {
      return '__file-icon __file-icon--archive';
    }
    return '__file-icon';
  }

  protected statusClass(status: AXPFileStatus): string {
    return `__status __status--${defaultTo(status, 'attached')}`;
  }

  protected statusLabel(status: AXPFileStatus): string {
    return `@layout:components.file-uploader.states.${defaultTo(status, 'attached')}`;
  }

  protected trackUploadedItem(item: AXPFileListItem): string {
    return `${item.name}-${item.status}-${item.id ?? ''}`;
  }

  //#endregion
}

//#endregion
