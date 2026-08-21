import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AXP_IDENTIFIER_SERVICE } from '@acorex-platform/module-identifier-management-client';
import { AXButtonModule } from '@acorex/components/button';

@Component({
  selector: 'identifier-test',
  standalone: true,
  imports: [CommonModule, FormsModule, AXButtonModule],
  template: `
    <div class="p-6 space-y-4 w-full">
      <h2 class="text-xl font-semibold">Identifier Generator Test</h2>

      <div class="grid grid-cols-2 gap-4">
        <label class="flex flex-col">
          <span class="text-sm text-muted">Entity</span>
          <input class="input" [(ngModel)]="entity" />
        </label>
        <label class="flex flex-col">
          <span class="text-sm text-muted">Tenant ID</span>
          <input class="input" [(ngModel)]="tenantId" />
        </label>
        <label class="flex flex-col">
          <span class="text-sm text-muted">App ID</span>
          <input class="input" [(ngModel)]="appId" />
        </label>
      </div>

      <div class="flex gap-2 flex-wrap w-full">
        <ax-button look="outline" color="primary" (click)="runSample('AXPInvoice','preview')" text="Sample: Invoice Preview"></ax-button>
        <ax-button look="outline" color="secondary" (click)="runSample('AXPInvoice','commit')" text="Sample: Invoice Commit"></ax-button>
        <ax-button look="outline" color="info" (click)="runSample('AXPOrder','preview')" text="Sample: Order Preview"></ax-button>
        <ax-button look="outline" color="info" (click)="runSample('AXPOrder','commit')" text="Sample: Order Commit"></ax-button>
      </div>

      <div>
        <div class="text-sm">Result:</div>
        <pre class="bg-muted p-3 rounded">{{ result() | json }}</pre>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdentifierTestComponent {
  private readonly identifiers = inject(AXP_IDENTIFIER_SERVICE);

  entity: string = 'AXPInvoice';
  tenantId?: string = 'demo';
  appId?: string = 'demo-app';
  result = signal<any>(null);

  async runSample(name: string, mode: 'preview' | 'commit'): Promise<void> {
    const res = await (mode === 'commit'
      ? this.identifiers.generate({ id: name })
      : this.identifiers.peek({ id: name }));
    this.result.set(res);
  }
}


