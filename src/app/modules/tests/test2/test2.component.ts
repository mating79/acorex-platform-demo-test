import { AXPTokenDefinitionService } from '@acorex-platform/framework-client/common';
import { AXPWidgetsCatalog, type AXPWidgetNode } from '@acorex-platform/framework-shared/core';
import { AXPWidgetCoreModule } from '@acorex-platform/framework-client/layout/widget-core';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';

@Component({
  selector: 'test2',
  templateUrl: './test2.component.html',
  styleUrl: './test2.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AXPWidgetCoreModule],
  standalone: true,
})
export class TestComponent2 implements OnInit {

  ngOnInit() {
    // Build nodes for all widgets (view, edit, designer) — excluding column-specific usage
    const widgetTypes = Object.values(AXPWidgetsCatalog);
    const nodes = widgetTypes.map((type) => ({
      type,
      node: {
        type: type as any,
        path: `test.${type}`,
      } as AXPWidgetNode,
    }));
    this.nodes.set(nodes);
  }

  nodes = signal<Array<{ type: string; node: AXPWidgetNode }>>([]);

  context = signal<any>({});
  log(e: any) {
    console.log(e);
  }
}
