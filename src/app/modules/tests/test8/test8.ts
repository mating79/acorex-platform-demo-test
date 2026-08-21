import { AXButtonModule } from '@acorex/components/button';
import { AXPSessionService } from '@acorex-platform/framework-client/auth';
import { AXPFileListItem } from '@acorex-platform/framework-shared/core';
import { AXPDragDropListItem } from '@acorex-platform/framework-client/layout/components';
import { type AXPWidgetNode } from '@acorex-platform/framework-shared/core';
import { AXPWidgetCoreModule } from '@acorex-platform/framework-client/layout/widget-core';

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'test8',
  templateUrl: './test8.html',
  styleUrl: './test8.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AXPWidgetCoreModule, AXButtonModule],
  standalone: true,
})
export class TestComponent8 {
  //#region ----   Services & Dependencies   ----

  private readonly router = inject(Router);
  private readonly sessionService = inject(AXPSessionService);

  //#endregion

  //#region ----   UI Handlers   ----

  /**
   * Navigates to Manufacturers list to test menu permission guard (in-app navigation).
   */
  protected navigateToManufacturerList(): void {
    const appName = this.sessionService.application?.name ?? 'ACoreX';
    void this.router.navigate([
      `/${appName}/m/BusinessCore/e/Manufacturer/list`,
    ]);
  }

  //#endregion

  node1 = signal<AXPWidgetNode>({
    type: 'text-editor',
    path: 'text-editor',
    defaultValue: {
      'en-US': 'text-editor',
      'ar-EG': '',
      'ar-SA': '',
      'en-AU': '',
      'en-CA': '',
      'en-NZ': '',
      'en-GB': '',
      'fr-CA': '',
      'fr-FR': '',
      'de-AT': '',
      'de-DE': '',
      'fa-IR': 'fa-text-editor',
      'es-AR': '',
      'es-MX': '',
      'es-ES': '',
    },
    options: { multiLanguage: true },
  });
  node2 = signal<AXPWidgetNode>({
    type: 'rich-text-editor',
    path: 'richText',
    defaultValue: {
      'en-US': 'rich-text-editor',
      'ar-EG': '',
      'ar-SA': '',
      'en-AU': '',
      'en-CA': '',
      'en-NZ': '',
      'en-GB': '',
      'fr-CA': '',
      'fr-FR': '',
      'de-AT': '',
      'de-DE': '',
      'fa-IR': 'fa-rich-text-editor',
      'es-AR': '',
      'es-MX': '',
      'es-ES': '',
    },
    options: {
      multiLanguage: true,
    },
  });
  node3 = signal<AXPWidgetNode>({
    type: 'large-text-editor',
    path: 'largeText',
    defaultValue: {
      'en-US': 'large-text-editor',
      'ar-EG': '',
      'ar-SA': '',
      'en-AU': '',
      'en-CA': '',
      'en-NZ': '',
      'en-GB': '',
      'fr-CA': '',
      'fr-FR': '',
      'de-AT': '',
      'de-DE': '',
      'fa-IR': 'fa-large-text-editor',
      'es-AR': '',
      'es-MX': '',
      'es-ES': '',
    },
    options: {
      multiLanguage: true,
    },
  });
  node4 = signal<AXPWidgetNode>({
    type: 'image',
    path: 'imageDemo',
    options: {
      type: 'avatar',
      // width: '320px',
      // height: '200px',
      // borderRadius: '8px',
      // aspectRatio: '16 / 9',
    },
    defaultValue: 'https://picsum.photos/400/400?random=1',
  });
  node5 = signal<AXPWidgetNode>({
    type: 'image',
    path: 'imageDemo',
    options: {
      type: 'cover',
      // width: '320px',
      // height: '200px',
      // borderRadius: '8px',
      // aspectRatio: '16 / 9',
    },
    defaultValue: 'https://picsum.photos/1200/600?random=2',
  });
  node6 = signal<AXPWidgetNode>({
    type: 'image',
    path: 'imageDemo',
    options: {
      type: 'thumbnail',
      width: '64px',
      // height: '200px',
      // borderRadius: '8px',
      // aspectRatio: '1 / 1',
    },
    defaultValue: 'https://picsum.photos/64/64?random=3',
  });
  node7 = signal<AXPWidgetNode>({
    type: 'image',
    path: 'imageDemo',
    options: {
      type: 'banner',
      // width: '320px',
      // height: '200px',
      // borderRadius: '8px',
      // aspectRatio: '16 / 9',
    },
    defaultValue: 'https://picsum.photos/1200/300?random=4',
  });
  node8 = signal<AXPWidgetNode>({
    type: 'gallery',
    path: 'galleryDemo',
    defaultValue: [
      {
        id: '1',
        name: 'sample-image-1.jpg',
        status: 'attached',
        source: {
          kind: 'url',
          value: 'https://picsum.photos/800/600?random=1',
        },
      },
      {
        id: '2',
        name: 'sample-image-2.jpg',
        status: 'attached',
        source: {
          kind: 'url',
          value: 'https://picsum.photos/800/600?random=2',
        },
      },
      {
        id: '3',
        name: 'sample-image-3.jpg',
        status: 'attached',
        source: {
          kind: 'url',
          value: 'https://picsum.photos/800/600?random=3',
        },
      },
      {
        id: '4',
        name: 'sample-image-4.jpg',
        status: 'attached',
        source: {
          kind: 'url',
          value: 'https://picsum.photos/800/600?random=4',
        },
      },
    ] as AXPFileListItem[],
    options: {
      thumbnail: false,
      header: true,
      fileInfo: true,
      fullScreenButton: true,
      height: '300px',
    },
  });

  node9 = signal<AXPWidgetNode>({
    type: 'contact-editor',
    path: 'contact-editor',
    defaultValue: {
      value: 'linkedin.com/in/ahmed-elgendy-1234567890',
      label: 'LinkedIn',
    },
    options: {
      type: 'social',
    },
  });

  node10 = signal<AXPWidgetNode>({
    type: 'qrcode',
    path: 'qrcodeDemo1',
    defaultValue: 'https://www.google.com',
    options: {
      size: 200,
      level: 'M',
      color: '#000000',
      outputType: 'svg',
    },
  });

  node11 = signal<AXPWidgetNode>({
    type: 'qrcode',
    path: 'qrcodeDemo2',
    defaultValue: 'Hello, World! This is a QR code demo.',
    options: {
      size: 150,
      level: 'H',
      color: '#0066cc',
      outputType: 'svg',
    },
  });

  node12 = signal<AXPWidgetNode>({
    type: 'qrcode',
    path: 'qrcodeDemo3',
    defaultValue: 'https://github.com',
    options: {
      size: 250,
      level: 'Q',
      color: '#ff6600',
      outputType: 'svg',
    },
  });

  node13 = signal<AXPWidgetNode>({
    type: 'qrcode',
    path: 'qrcodeDemo4',
    defaultValue: 'mailto:test@example.com?subject=Hello&body=Test',
    options: {
      size: 180,
      level: 'L',
      color: '#00aa00',
      outputType: 'svg',
    },
  });

  node14 = signal<AXPWidgetNode>({
    type: 'gallery',
    path: 'gallery',
    defaultValue: [
      {
        id: '1',
        name: 'image.jpg',
        status: 'attached',
        source: {
          kind: 'url',
          value:
            'https://api2.zoomit.ir/media/2022-9-not-connected-638bb8a3fa7dd26f3fcaf60e?w=1080&q=80',
        },
      },
    ] as AXPFileListItem[],
    options: {
      allowUploadTypes: [`text/plain`, `application/pdf`, `image/*`],
    },
  });

  //#region ---- Connected Lists Widget Demo ----

  /**
   * Available items for the connected drag-drop lists widget
   */
  private connectedListsAvailableItems: AXPDragDropListItem[] = [
    { id: 'item-1', content: 'Dashboard' },
    { id: 'item-2', content: 'Analytics' },
    { id: 'item-3', content: 'Reports' },
    { id: 'item-4', content: 'Settings' },
    { id: 'item-5', content: 'Users Management' },
    { id: 'item-6', content: 'Notifications' },
    { id: 'item-7', content: 'Calendar' },
    { id: 'item-8', content: 'Tasks' },
  ];

  /**
   * Connected Lists Widget - Using string[] as value (IDs only)
   */
  node15 = signal<AXPWidgetNode>({
    type: 'connected-lists-editor',
    path: 'connectedListsDemo1',
    defaultValue: ['item-1', 'item-3', 'item-5'],
    options: {
      availableItems: this.connectedListsAvailableItems,
      emptyMessage: 'No items available',
    },
  });

  /**
   * Connected Lists Widget - Using AXPDragDropListItem[] as value (full objects)
   */
  node16 = signal<AXPWidgetNode>({
    type: 'connected-lists-editor',
    path: 'connectedListsDemo2',
    defaultValue: [
      { id: 'item-2', content: 'Analytics' },
      { id: 'item-4', content: 'Settings' },
    ] as AXPDragDropListItem[],
    options: {
      availableItems: this.connectedListsAvailableItems,
      emptyMessage: 'Drag items here',
    },
  });

  /**
   * Connected Lists Widget - Empty initial selection
   */
  node17 = signal<AXPWidgetNode>({
    type: 'connected-lists-editor',
    path: 'connectedListsDemo3',
    defaultValue: [],
    options: {
      availableItems: this.connectedListsAvailableItems,
      emptyMessage: 'Drop items to select',
    },
  });

  //#endregion

  context = signal<any>({});
  log(e: any) {
    console.log(e);
  }
}
