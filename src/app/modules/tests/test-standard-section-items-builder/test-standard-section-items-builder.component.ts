import { AXPWidgetsList } from '@acorex-platform/framework-shared/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { AXButtonModule } from '@acorex/components/button';
import { AXDecoratorModule } from '@acorex/components/decorators';
import { AXDialogService } from '@acorex/components/dialog';
import { AXTranslationService } from '@acorex/core/translation';
import { AXPDataGenerator } from '@acorex-platform/framework-client/core';
import {
  type AXPBuilderItem,
  type AXPBuilderItemViewModel,
  type AXPBuilderValue,
  type AXPStandardSectionItemsBuilderConfig,
  AXPStandardSectionItemsBuilderComponent,
  AXPWidgetPropertyViewerService,
} from '@acorex-platform/framework-client/layout/components';
import { type AXPWidgetNode, type AXPWidgetProperty } from '@acorex-platform/framework-shared/widget-core';
import { cloneDeep } from 'lodash-es';

const textEditorIf = JSON.stringify({ type: 'text-editor', options: { placeholder: '' } });
const largeTextIf = JSON.stringify({ type: 'large-text-editor', options: {} });
const toggleIf = JSON.stringify({ type: 'toggle-editor', options: {} });

const INITIAL: AXPBuilderValue = {
  sections: [
    {
      id: 'std-demo-sec-default',
      order: 0,
      name: 'default',
      sectionItemId: 'default',
      title: 'Default Section',
      description: 'First block',
      tags: [],
      isVisible: true,
      items: [
        {
          id: 'std-item-code',
          order: 0,
          name: 'code',
          title: 'Code',
          description: 'Stable business or external code.',
          interface: textEditorIf,
        },
        {
          id: 'std-item-notes',
          order: 1,
          name: 'notes',
          title: 'Notes',
          description: 'Optional notes.',
          interface: largeTextIf,
        },
      ],
    },
    {
      id: 'std-demo-sec-sample',
      order: 1,
      name: 'sample-section',
      sectionItemId: 'sample-section',
      title: 'Sample Section',
      description: '',
      tags: [],
      isVisible: true,
      items: [
        {
          id: 'std-item-active',
          order: 0,
          name: 'isActive',
          title: 'Active',
          description: '',
          interface: toggleIf,
        },
      ],
    },
  ],
};

@Component({
  selector: 'demo-test-standard-section-items-builder',
  standalone: true,
  imports: [CommonModule, JsonPipe, AXButtonModule, AXDecoratorModule, AXPStandardSectionItemsBuilderComponent],
  templateUrl: './test-standard-section-items-builder.component.html',
  styleUrl: './test-standard-section-items-builder.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestStandardSectionItemsBuilderComponent {
  private readonly dialogService = inject(AXDialogService);
  private readonly translationService = inject(AXTranslationService);
  private readonly widgetPropertyViewerService = inject(AXPWidgetPropertyViewerService);

  private readonly standardRef = viewChild(AXPStandardSectionItemsBuilderComponent);

  protected readonly builderValue = signal<AXPBuilderValue>(structuredClone(INITIAL));

  protected readonly standardConfig: AXPStandardSectionItemsBuilderConfig;

  constructor() {
    this.standardConfig = {
      minSectionCount: 1,
      mapItemToView: (item, _s) => this.mapItemToView(item),
      promptAddItems: (_sid, v) => this.promptMockFields(v, _sid),
      promptEditItem: (item, _sid, v) => this.promptEditItem(item, v),
    };
  }

  protected onValueChange(next: AXPBuilderValue): void {
    this.builderValue.set(next);
  }

  protected resetSample(): void {
    this.builderValue.set(structuredClone(INITIAL));
  }

  protected async addSectionViaApi(): Promise<void> {
    await this.standardRef()?.addSection();
  }

  private mapItemToView(item: AXPBuilderItem): AXPBuilderItemViewModel {
    const iface = String(item['interface'] ?? '');
    return {
      icon: 'fa-light fa-input-text',
      title: String(item['title'] ?? ''),
      name: String(item['name'] ?? ''),
      description: typeof item['description'] === 'string' ? item['description'] : undefined,
      badges: [{ text: this.widgetLabelFromInterface(iface), variant: 'neutral' }],
    };
  }

  private widgetLabelFromInterface(interfaceValue: string): string {
    try {
      if (!interfaceValue) return 'Text';
      if (!interfaceValue.startsWith('{')) return interfaceValue;
      const parsed = JSON.parse(interfaceValue);
      const widgetType = parsed?.type || 'text-editor';
      return (
        String(widgetType)
          .replace(/-/g, ' ')
          .replace(/editor/gi, '')
          .trim()
          .split(' ')
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ') || 'Text'
      );
    } catch {
      return 'Text';
    }
  }

  private async promptMockFields(value: AXPBuilderValue, sectionId: string): Promise<AXPBuilderItem[] | null> {
    const section = value.sections.find((s) => s.id === sectionId);
    if (!section) return null;
    const taken = this.collectItemNames(value);
    const base = `mockField`;
    let name = base;
    let i = 0;
    while (taken.has(name)) {
      i += 1;
      name = `${base}${i}`;
    }
    return [
      {
        id: AXPDataGenerator.uuid(),
        order: section.items.length,
        name,
        title: `Mock field (${name})`,
        description: 'Simulated picker.',
        interface: textEditorIf,
      },
    ];
  }

  private async promptEditItem(item: AXPBuilderItem, value: AXPBuilderValue): Promise<AXPBuilderItem | null> {
    try {
      const ifaceRaw = item['interface'];
      const ifaceStr = typeof ifaceRaw === 'string' ? ifaceRaw : JSON.stringify(ifaceRaw ?? {});
      if (!ifaceStr.trim()) throw new Error('Field interface is empty');
      let currentWidget: AXPWidgetNode;
      try {
        currentWidget = JSON.parse(ifaceStr);
      } catch {
        throw new Error('Failed to parse field interface');
      }
      if (!currentWidget?.type) throw new Error('Invalid widget configuration');

      const fieldName = String(item['title'] || item['name'] || 'Field');
      const editTitle =
        (await this.translationService.translateAsync('@general:actions.configure.title', {
          params: { name: fieldName },
        })) || `Configure ${fieldName}`;

      const seededWidget: AXPWidgetNode = {
        ...cloneDeep(currentWidget),
        name: String(item['name'] ?? ''),
        options: {
          ...(cloneDeep(currentWidget.options) ?? {}),
          label: String(item['title'] ?? ''),
        },
      };

      const duplicateNameMessage =
        (await this.translationService.translateAsync(
          '@data-management:metadata-definitions.components.meta-data-selector.basic-info.name-duplicate',
        )) || 'A field with this name already exists.';
      const overrideProperties = this.buildFieldOverrideProperties(item, value, duplicateNameMessage);

      const result = await this.widgetPropertyViewerService
        .create()
        .dialog((d) => {
          d.setMode('advanced');
          d.setTitle(editTitle).setWidget(seededWidget);
          d.setExclude(['name']);
          d.setCustom({ properties: overrideProperties });
        })
        .show();

      if (!result?.values) return null;

      const updatedWidget: AXPWidgetNode = {
        ...currentWidget,
        ...result.values,
        options: { ...(currentWidget.options ?? {}), ...(result.values.options ?? {}) },
      };
      const overriddenName =
        typeof result.values?.name === 'string' && result.values.name.trim()
          ? result.values.name.trim()
          : String(item['name'] ?? '');
      const overriddenTitle =
        result.values?.options?.label != null && result.values.options.label !== ''
          ? result.values.options.label
          : String(item['title'] ?? '');

      return {
        ...item,
        name: overriddenName,
        title: overriddenTitle,
        interface: JSON.stringify(updatedWidget),
      };
    } catch (error) {
      console.error('Standard demo item edit:', error);
      await this.dialogService.alert(
        (await this.translationService.translateAsync('@general:messages.error.title')) || 'Error',
        error instanceof Error ? error.message : 'Failed to edit field',
        'danger',
      );
      return null;
    }
  }

  private buildFieldOverrideProperties(
    currentItem: AXPBuilderItem,
    value: AXPBuilderValue,
    duplicateNameMessage: string,
  ) {
    const basicGroup = {
      name: 'basic-info',
      order: -1,
      title: '@data-management:metadata-definitions.components.meta-data-selector.basic-info.title',
    };
    const siblingNames = this.collectItemNames(value, String(currentItem.id));
    const nameProperty: AXPWidgetProperty = {
      name: 'fieldName',
      title: '@general:terms.common.name',
      group: basicGroup,
      order: 0,
      schema: {
        dataType: 'string',
        interface: { name: 'name', path: 'name', type: AXPWidgetsList.Editors.TextBox },
      },
      validations: [
        { rule: 'required' },
        { rule: 'variable-name' },
        {
          rule: 'callback',
          options: {
            message: duplicateNameMessage,
            validate: (val: unknown) => {
              const name = typeof val === 'string' ? val.trim() : '';
              if (!name) return { result: true };
              return { result: !siblingNames.has(name), message: duplicateNameMessage };
            },
          },
        },
      ],
      visible: true,
    };
    const titleProperty: AXPWidgetProperty = {
      name: 'fieldTitle',
      title: '@general:terms.common.title',
      group: basicGroup,
      order: 1,
      schema: {
        dataType: 'string',
        interface: { name: 'label', path: 'options.label', type: AXPWidgetsList.Editors.TextBox },
      },
      validations: [{ rule: 'required' }],
      visible: true,
    };
    return [
      { property: nameProperty, tab: { name: 'general' }, group: basicGroup },
      { property: titleProperty, tab: { name: 'general' }, group: basicGroup },
    ];
  }

  private collectItemNames(value: AXPBuilderValue, excludeItemId?: string): Set<string> {
    const names = new Set<string>();
    for (const s of value.sections) {
      for (const it of s.items) {
        if (excludeItemId != null && it.id === excludeItemId) continue;
        const n = it['name'];
        if (typeof n === 'string' && n) names.add(n);
      }
    }
    return names;
  }
}
