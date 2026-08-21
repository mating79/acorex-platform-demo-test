import { AXPWidgetsList } from '@acorex-platform/framework-shared/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { AXButtonModule } from '@acorex/components/button';
import { AXDecoratorModule } from '@acorex/components/decorators';
import { AXDialogService } from '@acorex/components/dialog';
import { AXTranslationService } from '@acorex/core/translation';
import { AXPDataGenerator } from '@acorex-platform/framework-client/core';
import {
  type AXPBuilderDefinition,
  type AXPBuilderItem,
  type AXPBuilderItemViewModel,
  type AXPBuilderSection,
  type AXPBuilderValue,
  type AXPPropertyViewerResult,
  AXPPropertyViewerService,
  AXPSectionItemsBuilderComponent,
  AXPWidgetPropertyViewerService,
} from '@acorex-platform/framework-client/layout/components';
import { type AXPWidgetNode, type AXPWidgetProperty } from '@acorex-platform/framework-shared/widget-core';
import { cloneDeep } from 'lodash-es';
import { DEMO_META_SECTION_EDIT_TABS } from './section-items-builder-demo.section-tabs';

const textEditorIf = JSON.stringify({ type: 'text-editor', options: { placeholder: '' } });
const largeTextIf = JSON.stringify({ type: 'large-text-editor', options: {} });
const toggleIf = JSON.stringify({ type: 'toggle-editor', options: {} });

const INITIAL_BUILDER_VALUE: AXPBuilderValue = {
  sections: [
    {
      id: 'demo-sec-default',
      order: 0,
      name: 'default',
      title: 'Default Section',
      items: [
        {
          id: 'demo-item-code',
          order: 0,
          name: 'code',
          title: 'Code',
          description: 'Stable business or external code.',
          interface: textEditorIf,
        },
        {
          id: 'demo-item-notes',
          order: 1,
          name: 'notes',
          title: 'Notes',
          description: 'Optional notes.',
          interface: largeTextIf,
        },
      ],
    },
    {
      id: 'demo-sec-sample',
      order: 1,
      name: 'sample-section',
      title: 'Sample Section',
      items: [
        {
          id: 'demo-item-active',
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

interface SectionFormContext {
  name?: string;
  title?: string;
  description?: string;
}

@Component({
  selector: 'demo-test-section-items-builder',
  standalone: true,
  imports: [CommonModule, JsonPipe, AXButtonModule, AXDecoratorModule, AXPSectionItemsBuilderComponent],
  templateUrl: './test-section-items-builder.component.html',
  styleUrl: './test-section-items-builder.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestSectionItemsBuilderDemoComponent {
  private readonly dialogService = inject(AXDialogService);
  private readonly translationService = inject(AXTranslationService);
  private readonly propertyViewerService = inject(AXPPropertyViewerService);
  private readonly widgetPropertyViewerService = inject(AXPWidgetPropertyViewerService);

  private readonly builder = viewChild(AXPSectionItemsBuilderComponent);

  protected readonly builderValue = signal<AXPBuilderValue>(structuredClone(INITIAL_BUILDER_VALUE));

  /**
   * Mirrors meta-data selector group/field behavior using {@link AXPSectionItemsBuilderComponent}
   * (sections + items, DnD, property viewer for sections, widget viewer for items, mock add-field).
   */
  protected readonly definition: AXPBuilderDefinition = {
    texts: {
      addSection: '@data-management:metadata-definitions.actions.add-group.title',
      addItem: '@general:actions.add-item.title',
      emptySectionsTitle:
        '@data-management:metadata-definitions.components.meta-data-selector.empty-states.no-groups.title',
      emptySectionsDescription:
        '@data-management:metadata-definitions.components.meta-data-selector.empty-states.no-groups.description',
      emptyItemsTitle:
        '@data-management:metadata-definitions.components.meta-data-selector.empty-states.empty-group.title',
      emptyItemsDescription:
        '@data-management:metadata-definitions.components.meta-data-selector.empty-states.empty-group.description',
      defaultSectionBadge:
        '@data-management:metadata-definitions.components.meta-data-selector.default-section-badge',
    },
    showSectionTechnicalName: true,
    isDefaultSection: (section) =>
      String(section['name'] ?? '') === 'default' && !String(section['title'] ?? '').trim(),
    minSectionCount: 1,
    mapItemToView: (item, _section) => this.mapItemToView(item),
    promptAddSection: (v) => this.promptSectionForm(v, 'add'),
    promptEditSection: (section, v) => this.promptSectionForm(v, 'edit', section),
    promptAddItems: (_sectionId, v) => this.promptMockMetaFields(v, _sectionId),
    promptEditItem: (item, _sectionId, v) => this.promptEditMetaLikeItem(item, v),
    confirmRemoveSection: (_section) => this.confirmDeleteSection(),
    confirmRemoveItem: (_item, _sectionId) => this.confirmDeleteItem(),
  };

  protected onValueChange(next: AXPBuilderValue): void {
    this.builderValue.set(next);
  }

  protected resetSample(): void {
    this.builderValue.set(structuredClone(INITIAL_BUILDER_VALUE));
  }

  /** Same as page command: programmatically open “add section”. */
  protected async addSectionViaApi(): Promise<void> {
    await this.builder()?.addSection();
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

  private isSectionNameDuplicate(value: AXPBuilderValue, name: string, excludeSectionId?: string): boolean {
    const n = name.trim().toLowerCase();
    return value.sections.some(
      (s) => s.id !== excludeSectionId && String(s['name'] ?? '').trim().toLowerCase() === n,
    );
  }

  private async promptSectionForm(
    value: AXPBuilderValue,
    mode: 'add' | 'edit',
    section?: AXPBuilderSection,
  ): Promise<Record<string, unknown> | null> {
    const titleKey =
      mode === 'add'
        ? '@data-management:metadata-definitions.actions.add-group.title'
        : '@data-management:metadata-definitions.actions.edit-group.title';
    const initial: SectionFormContext =
      mode === 'edit' && section
        ? {
          name: String(section['name'] ?? ''),
          title: String(section['title'] ?? section['name'] ?? ''),
          description: String(section['description'] ?? ''),
        }
        : { name: '', title: '', description: '' };
    const excludeId = mode === 'edit' ? section?.id : undefined;

    const result = await this.propertyViewerService
      .create()
      .dialog((d) => {
        d.setTitle(titleKey)
          .setSize('md')
          .setCloseButton(true)
          .setMode('advanced')
          .setTabs(DEMO_META_SECTION_EDIT_TABS)
          .setContext({
            name: initial.name ?? '',
            title: initial.title ?? '',
            description: initial.description ?? '',
          })
          .onAction(async (ref) => {
            const context = ref.context() as SectionFormContext;
            const name = context.name?.trim();
            if (!name || !context.title?.trim()) {
              throw new Error('SectionFormValidation');
            }
            if (this.isSectionNameDuplicate(value, name, excludeId)) {
              await this.dialogService.alert(
                await this.translationService.translateAsync(
                  '@data-management:metadata-definitions.components.meta-data-selector.dialogs.group-name-duplicate.title',
                ),
                await this.translationService.translateAsync(
                  '@data-management:metadata-definitions.components.meta-data-selector.dialogs.group-name-duplicate.message',
                ),
                'danger',
              );
              throw new Error('SectionNameDuplicate');
            }
          });
      })
      .show();

    if (!result) return null;
    const values = (result as AXPPropertyViewerResult).values as SectionFormContext;
    const name = values.name?.trim() ?? '';
    const title = values.title?.trim() ?? '';
    if (!name || !title) return null;
    return {
      name,
      title,
      description: typeof values.description === 'string' ? values.description : '',
    };
  }

  /** Simulates meta-data “pick definitions” without API: adds one text field with a unique name. */
  private async promptMockMetaFields(
    value: AXPBuilderValue,
    sectionId: string,
  ): Promise<AXPBuilderItem[] | null> {
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
        description: 'Simulated picker — no meta-data API.',
        interface: textEditorIf,
      },
    ];
  }

  private async promptEditMetaLikeItem(
    item: AXPBuilderItem,
    value: AXPBuilderValue,
  ): Promise<AXPBuilderItem | null> {
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
      console.error('Demo item edit:', error);
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

  private async confirmDeleteSection(): Promise<boolean> {
    const res = await this.dialogService.confirm(
      await this.translationService.translateAsync('@data-management:metadata-definitions.actions.delete-group.title'),
      await this.translationService.translateAsync(
        '@data-management:metadata-definitions.components.meta-data-selector.dialogs.delete-group.message',
      ),
      'danger',
      'horizontal',
      false,
    );
    return typeof res === 'boolean' ? res : res.result;
  }

  private async confirmDeleteItem(): Promise<boolean> {
    const res = await this.dialogService.confirm(
      (await this.translationService.translateAsync('@general:actions.delete.title')) || 'Delete',
      (await this.translationService.translateAsync('@general:workflow.confirm-delete')) ||
      'Remove this item?',
      'danger',
      'horizontal',
      false,
    );
    return typeof res === 'boolean' ? res : res.result;
  }
}
