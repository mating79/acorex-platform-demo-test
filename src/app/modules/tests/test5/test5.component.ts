import { AXButtonModule } from '@acorex/components/button';
import { AXDecoratorModule } from '@acorex/components/decorators';
import {
  AXPWorkflowDesignerComponent,
  AXPWorkflowPaletteItemDragDirective,
  defaultCanConnectRequest,
  type AXPWorkflowActivityPaletteItem,
  type AXPWorkflowConnectionPreviewStyle,
  type AXPWorkflowConnectRequest,
  type AXPWorkflowDesignerActivation,
  type AXPWorkflowDiagramModel,
  type AXPWorkflowNodeBodyTemplateContext,
} from '@acorex-platform/module-platform-management-client';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, TemplateRef, viewChild } from '@angular/core';

//#region ---- Demo page: workflow designer + panel ----

@Component({
  selector: 'test5',
  templateUrl: './test5.component.html',
  styleUrl: './test5.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    AXButtonModule,
    AXDecoratorModule,
    AXPWorkflowPaletteItemDragDirective,
    AXPWorkflowDesignerComponent,
  ],
})
export class Test5Component {
  protected readonly customNodeTpl = viewChild<TemplateRef<AXPWorkflowNodeBodyTemplateContext>>('customNode');

  protected readonly demoReadonly = signal(false);
  protected readonly useCustomNodeBody = signal(true);
  protected readonly blockIntoStart = signal(true);

  protected readonly gridSize = signal(20);
  protected readonly snapToGrid = signal(true);
  protected readonly showPortLabels = signal(true);
  protected readonly backgroundPattern = signal<'line' | 'dots'>('dots');
  protected readonly connectionPreviewStyle = signal<AXPWorkflowConnectionPreviewStyle>('rounded');

  protected readonly model = signal<AXPWorkflowDiagramModel>(this.createRegisterOtpTemplate());
  protected readonly modelJson = signal('');
  protected readonly eventLog = signal<string[]>([]);
  protected readonly lastActivation = signal<AXPWorkflowDesignerActivation | null>(null);

  protected readonly paletteItems: AXPWorkflowActivityPaletteItem[] = [
    {
      type: 'start',
      title: 'Start Registration',
      icon: 'fa-solid fa-play',
      shape: 'circle',
      size: { width: 88, height: 88 },
      inboundPorts: [],
      outboundPorts: [{ side: 'right', ratio: 0.5, key: 'out', label: 'start' }],
      color: 'success',
      data: { step: 'start-registration', layer: 'orchestration', action: 'entry' },
    },
    {
      type: 'ui-collect-user-input',
      title: 'UI: Collect User Input',
      icon: 'fa-solid fa-user-pen',
      shape: 'rounded-rectangle',
      size: { width: 220, height: 90 },
      inboundPorts: [{ side: 'left', ratio: 0.5, key: 'in', label: 'in' }],
      outboundPorts: [{ side: 'right', ratio: 0.5, key: 'out', label: 'valid form' }],
      color: 'primary',
      data: { step: 'ui-collect-user-input', layer: 'ui', action: 'form' },
    },
    {
      type: 'ui-client-validation',
      title: 'UI: Client Validation',
      icon: 'fa-solid fa-list-check',
      shape: 'rectangle',
      size: { width: 200, height: 80 },
      inboundPorts: [{ side: 'left', ratio: 0.5, key: 'in', label: 'input' }],
      outboundPorts: [{ side: 'right', ratio: 0.5, key: 'out', label: 'valid payload' }],
      color: 'primary',
      data: { step: 'ui-client-validation', layer: 'ui', action: 'validate' },
    },
    {
      type: 'api-rate-limit',
      title: 'API: Rate Limit',
      icon: 'fa-solid fa-gauge-high',
      shape: 'diamond',
      size: { width: 150, height: 150 },
      lockAspectRatio: true,
      inboundPorts: [{ side: 'left', ratio: 0.5, key: 'in', label: 'request' }],
      outboundPorts: [
        { side: 'right', ratio: 0.4, key: 'ok', label: 'allowed' },
        { side: 'bottom', ratio: 0.5, key: 'limit', label: 'limited' },
      ],
      color: 'warning',
      data: { step: 'api-rate-limit', layer: 'backend', action: 'throttle' },
    },
    {
      type: 'validate-uniqueness',
      title: 'Backend: Validate Email/Phone',
      icon: 'fa-solid fa-user-check',
      shape: 'diamond',
      size: { width: 160, height: 160 },
      lockAspectRatio: true,
      inboundPorts: [{ side: 'left', ratio: 0.5, key: 'in', label: 'request' }],
      outboundPorts: [
        { side: 'right', ratio: 0.3, key: 'ok', label: 'available' },
        { side: 'bottom', ratio: 0.5, key: 'dup', label: 'duplicate' },
      ],
      color: 'warning',
      data: { step: 'validate-uniqueness', layer: 'backend', action: 'duplicate-check' },
    },
    {
      type: 'create-otp',
      title: 'Security: Create OTP Challenge',
      icon: 'fa-solid fa-shield-keyhole',
      shape: 'rectangle',
      size: { width: 260, height: 84 },
      inboundPorts: [{ side: 'left', ratio: 0.5, key: 'in', label: 'available' }],
      outboundPorts: [{ side: 'right', ratio: 0.5, key: 'out', label: 'challenge id' }],
      color: 'secondary',
      data: { step: 'create-otp', layer: 'security', action: 'otp-generate' },
    },
    {
      type: 'send-otp',
      title: 'Integration: Dispatch OTP',
      icon: 'fa-solid fa-message-sms',
      shape: 'rectangle',
      size: { width: 190, height: 80 },
      inboundPorts: [{ side: 'left', ratio: 0.5, key: 'in', label: 'available' }],
      outboundPorts: [
        { side: 'right', ratio: 0.5, key: 'sent', label: 'OTP sent' },
        { side: 'bottom', ratio: 0.5, key: 'send-failed', label: 'send failed' },
      ],
      color: 'secondary',
      data: { step: 'send-otp', layer: 'integration', action: 'sms-or-email' },
    },
    {
      type: 'ui-enter-otp',
      title: 'UI: Enter OTP',
      icon: 'fa-solid fa-mobile-screen',
      shape: 'ellipse',
      size: { width: 200, height: 95 },
      inboundPorts: [{ side: 'left', ratio: 0.5, key: 'in', label: 'OTP sent' }],
      outboundPorts: [{ side: 'right', ratio: 0.5, key: 'out', label: 'submit OTP' }],
      color: 'primary',
      data: { step: 'ui-enter-otp', layer: 'ui', action: 'collect-otp' },
    },
    {
      type: 'verify-otp',
      title: 'Backend: Verify OTP',
      icon: 'fa-solid fa-shield-check',
      shape: 'ellipse',
      size: { width: 220, height: 105 },
      inboundPorts: [
        { side: 'left', ratio: 0.5, key: 'in', label: 'OTP entered' },
        { side: 'top', ratio: 0.5, key: 'retry-in', label: 'retry', allowMultiple: true },
      ],
      outboundPorts: [
        { side: 'right', ratio: 0.2, key: 'verified', label: 'verified' },
        { side: 'right', ratio: 0.5, key: 'wrong', label: 'wrong OTP' },
        { side: 'right', ratio: 0.8, key: 'expired', label: 'expired' },
      ],
      color: 'primary',
      data: { step: 'verify-otp', layer: 'backend', action: 'otp-verify' },
    },
    {
      type: 'fraud-check',
      title: 'Security: Fraud Check',
      icon: 'fa-solid fa-user-shield',
      shape: 'diamond',
      size: { width: 160, height: 160 },
      lockAspectRatio: true,
      inboundPorts: [{ side: 'left', ratio: 0.5, key: 'in', label: 'verified' }],
      outboundPorts: [
        { side: 'right', ratio: 0.4, key: 'ok', label: 'clean' },
        { side: 'bottom', ratio: 0.5, key: 'risk', label: 'high risk' },
      ],
      color: 'warning',
      data: { step: 'fraud-check', layer: 'security', action: 'risk-score' },
    },
    {
      type: 'create-user',
      title: 'Backend: Create User Account',
      icon: 'fa-solid fa-user-plus',
      shape: 'rounded-rectangle',
      size: { width: 220, height: 90 },
      inboundPorts: [{ side: 'left', ratio: 0.5, key: 'in', label: 'verified' }],
      outboundPorts: [
        { side: 'right', ratio: 0.5, key: 'created', label: 'created' },
        { side: 'bottom', ratio: 0.5, key: 'failed', label: 'db failed' },
      ],
      color: 'success',
      data: { step: 'create-user', layer: 'backend', action: 'users-insert' },
    },
    {
      type: 'create-profile',
      title: 'Backend: Create Profile',
      icon: 'fa-solid fa-id-card',
      shape: 'rounded-rectangle',
      size: { width: 220, height: 90 },
      inboundPorts: [{ side: 'left', ratio: 0.5, key: 'in', label: 'user id' }],
      outboundPorts: [{ side: 'right', ratio: 0.5, key: 'out', label: 'profile id' }],
      color: 'success',
      data: { step: 'create-profile', layer: 'backend', action: 'profiles-insert' },
    },
    {
      type: 'publish-event',
      title: 'Integration: Publish UserRegistered',
      icon: 'fa-solid fa-bullhorn',
      shape: 'rectangle',
      size: { width: 270, height: 84 },
      inboundPorts: [{ side: 'left', ratio: 0.5, key: 'in', label: 'profile ready' }],
      outboundPorts: [{ side: 'right', ratio: 0.5, key: 'out', label: 'event published' }],
      color: 'secondary',
      data: { step: 'publish-event', layer: 'integration', action: 'event-bus' },
    },
    {
      type: 'issue-token',
      title: 'Issue Session Token',
      icon: 'fa-solid fa-key',
      shape: 'rectangle',
      size: { width: 190, height: 80 },
      inboundPorts: [{ side: 'left', ratio: 0.5, key: 'in', label: 'created' }],
      outboundPorts: [{ side: 'right', ratio: 0.5, key: 'out', label: 'token' }],
      color: 'secondary',
      data: { step: 'issue-token', layer: 'backend', action: 'auth-token' },
    },
    {
      type: 'end-success',
      title: 'End: Registration Success',
      icon: 'fa-solid fa-circle-check',
      shape: 'circle',
      size: { width: 98, height: 98 },
      inboundPorts: [{ side: 'left', ratio: 0.5, key: 'in', label: 'done', allowMultiple: true }],
      outboundPorts: [],
      color: 'success',
      data: { step: 'end-success', layer: 'orchestration', action: 'completed' },
    },
    {
      type: 'end-failed',
      title: 'End: Registration Failed',
      icon: 'fa-solid fa-circle-xmark',
      shape: 'circle',
      size: { width: 98, height: 98 },
      inboundPorts: [{ side: 'left', ratio: 0.5, key: 'in', label: 'failed', allowMultiple: true }],
      outboundPorts: [],
      color: 'danger',
      data: { step: 'end-failed', layer: 'orchestration', action: 'failed' },
    },
  ];

  protected readonly canConnectDemo = (request: AXPWorkflowConnectRequest): boolean => {
    if (this.blockIntoStart()) {
      const target = request.model.nodes.find((n) => n.id === request.targetNodeId);
      if (target?.type === 'start') {
        return false;
      }
    }
    return defaultCanConnectRequest(request);
  };

  protected onModelChange(next: AXPWorkflowDiagramModel): void {
    this.model.set(next);
  }

  protected toggleReadonly(): void {
    this.demoReadonly.update((v) => !v);
    this.pushLog(`demoReadonly = ${this.demoReadonly()}`);
  }

  protected setBlockIntoStartFromCheckbox(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.blockIntoStart.set(checked);
    this.pushLog(`blockIntoStart = ${checked}`);
  }

  protected setSnapFromCheckbox(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.snapToGrid.set(checked);
    this.pushLog(`snapToGrid = ${checked}`);
  }

  protected setShowPortLabelsFromCheckbox(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.showPortLabels.set(checked);
    this.pushLog(`showPortLabels = ${checked}`);
  }

  protected setCustomNodeBodyFromCheckbox(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.useCustomNodeBody.set(checked);
    this.pushLog(`useCustomNodeBody = ${checked}`);
  }

  protected onGridSizeInput(event: Event): void {
    const v = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(v)) return;
    const clamped = Math.min(80, Math.max(8, Math.round(v)));
    this.gridSize.set(clamped);
    this.pushLog(`gridSize = ${clamped}`);
  }

  protected onPreviewStyleChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value as AXPWorkflowConnectionPreviewStyle;
    if (v === 'straight' || v === 'rounded' || v === 'orthogonal') {
      this.connectionPreviewStyle.set(v);
      this.pushLog(`connectionPreviewStyle = ${v}`);
    }
  }

  protected onBackgroundPatternChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'line' || value === 'dots') {
      this.backgroundPattern.set(value);
      this.pushLog(`backgroundPattern = ${value}`);
    }
  }

  protected resetDiagram(): void {
    this.model.set({ nodes: [], connectors: [] });
    this.modelJson.set('');
    this.pushLog('diagram reset');
  }

  protected arrangeLayout(wf: AXPWorkflowDesignerComponent): void {
    wf.arrangeNicely();
    this.pushLog('diagram arranged');
  }

  protected loadRegisterOtpTemplate(): void {
    const next = this.createRegisterOtpTemplate();
    this.model.set(next);
    this.modelJson.set(JSON.stringify(next, null, 2));
    this.pushLog('loaded register + OTP template');
  }

  protected onModelJsonInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.modelJson.set(value);
  }

  protected exportModelToJson(): void {
    const value = JSON.stringify(this.model(), null, 2);
    this.modelJson.set(value);
    this.pushLog('model exported to JSON');
  }

  protected importModelFromJson(): void {
    const raw = this.modelJson().trim();
    if (!raw) {
      this.pushLog('import skipped: JSON is empty');
      return;
    }
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!this.isWorkflowDiagramModel(parsed)) {
        this.pushLog('import failed: invalid diagram schema');
        return;
      }
      this.model.set(parsed);
      this.pushLog(`model imported from JSON (nodes=${parsed.nodes.length}, connectors=${parsed.connectors.length})`);
    } catch {
      this.pushLog('import failed: invalid JSON');
    }
  }

  protected clearLog(): void {
    this.eventLog.set([]);
  }

  protected onDesignerActivation(a: AXPWorkflowDesignerActivation | null): void {
    this.lastActivation.set(a);
    this.pushLog(
      a ? `activationChange: ${a.kind} id=${a.id}${a.nodeId ? ` nodeId=${a.nodeId}` : ''}` : 'activationChange: (null)',
    );
  }

  protected onConnectionCreated(e: { connector: { id: string }; model: AXPWorkflowDiagramModel }): void {
    this.pushLog(`connectionCreated: ${e.connector.id} (connectors=${e.model.connectors.length})`);
  }

  protected onConnectionRejected(e: { reason: string; request: AXPWorkflowConnectRequest }): void {
    this.pushLog(`connectionRejected: ${e.reason}`);
  }

  protected onLinkDragStart(e: { sourceNode: { id: string }; sourcePort: { id: string } }): void {
    this.pushLog(`linkDragStart: node=${e.sourceNode.id} port=${e.sourcePort.id}`);
  }

  protected onLinkDragEnd(e: { cancelled: boolean }): void {
    this.pushLog(`linkDragEnd: cancelled=${e.cancelled}`);
  }

  protected onNodeDragStart(e: { node: { id: string } }): void {
    this.pushLog(`nodeDragStart: ${e.node.id}`);
  }

  protected onNodeDragEnd(e: { node: { id: string } }): void {
    this.pushLog(`nodeDragEnd: ${e.node.id}`);
  }

  protected onNodeClick(e: { node: { id: string; title: string } }): void {
    this.pushLog(`nodeClick: ${e.node.title} (${e.node.id})`);
  }

  protected onNodeDoubleClick(e: { node: { id: string } }): void {
    this.pushLog(`nodeDoubleClick: ${e.node.id}`);
  }

  protected onConnectorClick(e: { connector: { id: string } }): void {
    this.pushLog(`connectorClick: ${e.connector.id}`);
  }

  protected onConnectorDoubleClick(e: { connector: { id: string } }): void {
    this.pushLog(`connectorDoubleClick: ${e.connector.id}`);
  }

  protected onPortPointerDown(e: { node: { id: string }; port: { id: string; kind: string } }): void {
    this.pushLog(`portPointerDown: node=${e.node.id} port=${e.port.id} (${e.port.kind})`);
  }

  protected onDesignerClick(): void {
    this.pushLog('designerClick (canvas background)');
  }

  protected onDesignerDoubleClick(): void {
    this.pushLog('designerDoubleClick (canvas background)');
  }

  protected onPaletteDragStart(e: { item: { type: string } }): void {
    this.pushLog(`palette activityDragStart: ${e.item.type}`);
  }

  protected onPaletteDragEnd(e: { item: { type: string } | null }): void {
    this.pushLog(`palette activityDragEnd: ${e.item?.type ?? 'none'}`);
  }

  protected onPaletteClick(item: AXPWorkflowActivityPaletteItem): void {
    this.pushLog(`palette row click: ${item.type}`);
  }

  protected onPaletteDoubleClick(item: AXPWorkflowActivityPaletteItem): void {
    this.pushLog(`palette row doubleClick: ${item.type}`);
  }

  private isWorkflowDiagramModel(value: unknown): value is AXPWorkflowDiagramModel {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as { nodes?: unknown; connectors?: unknown };
    return Array.isArray(candidate.nodes) && Array.isArray(candidate.connectors);
  }

  private createRegisterOtpTemplate(): AXPWorkflowDiagramModel {
    return {
      data: { useCase: 'register-with-otp-advanced', version: 2 },
      nodes: [
        {
          id: 'n-start',
          type: 'start',
          title: 'Start Registration',
          icon: 'fa-solid fa-play',
          shape: 'circle',
          position: { x: 60, y: 200 },
          size: { width: 88, height: 88 },
          inboundPorts: [],
          outboundPorts: [
            { id: 'p-start-out', kind: 'outbound', side: 'right', ratio: 0.5, key: 'out', label: 'start' },
          ],
          color: 'success',
          data: { step: 'start-registration' },
        },
        {
          id: 'n-input',
          type: 'ui-collect-user-input',
          title: 'UI: Collect User Input',
          icon: 'fa-solid fa-user-pen',
          shape: 'rounded-rectangle',
          position: { x: 260, y: 195 },
          size: { width: 220, height: 90 },
          inboundPorts: [{ id: 'p-input-in', kind: 'inbound', side: 'left', ratio: 0.5, key: 'in', label: 'in' }],
          outboundPorts: [
            { id: 'p-input-out', kind: 'outbound', side: 'right', ratio: 0.5, key: 'out', label: 'valid' },
          ],
          color: 'primary',
          data: { step: 'ui-collect-user-input', layer: 'ui', action: 'form' },
        },
        {
          id: 'n-ui-validate',
          type: 'ui-client-validation',
          title: 'UI: Client Validation',
          icon: 'fa-solid fa-list-check',
          shape: 'rectangle',
          position: { x: 620, y: 200 },
          size: { width: 200, height: 80 },
          inboundPorts: [
            { id: 'p-ui-validate-in', kind: 'inbound', side: 'left', ratio: 0.5, key: 'in', label: 'input' },
          ],
          outboundPorts: [
            {
              id: 'p-ui-validate-out',
              kind: 'outbound',
              side: 'right',
              ratio: 0.5,
              key: 'out',
              label: 'valid payload',
            },
          ],
          color: 'primary',
          data: { step: 'ui-client-validation', layer: 'ui', action: 'validate' },
        },
        {
          id: 'n-rate-limit',
          type: 'api-rate-limit',
          title: 'API: Rate Limit',
          icon: 'fa-solid fa-gauge-high',
          shape: 'diamond',
          position: { x: 920, y: 160 },
          size: { width: 150, height: 150 },
          inboundPorts: [{ id: 'p-rate-in', kind: 'inbound', side: 'left', ratio: 0.5, key: 'in', label: 'request' }],
          outboundPorts: [
            { id: 'p-rate-ok', kind: 'outbound', side: 'right', ratio: 0.4, key: 'ok', label: 'allowed' },
            { id: 'p-rate-limited', kind: 'outbound', side: 'bottom', ratio: 0.5, key: 'limited', label: 'limited' },
          ],
          lockAspectRatio: true,
          color: 'warning',
          data: { step: 'api-rate-limit', layer: 'backend', action: 'throttle' },
        },
        {
          id: 'n-unique',
          type: 'validate-uniqueness',
          title: 'Backend: Validate Email/Phone',
          icon: 'fa-solid fa-user-check',
          shape: 'diamond',
          position: { x: 1220, y: 150 },
          size: { width: 160, height: 160 },
          inboundPorts: [{ id: 'p-unique-in', kind: 'inbound', side: 'left', ratio: 0.5, key: 'in', label: 'request' }],
          outboundPorts: [
            { id: 'p-unique-ok', kind: 'outbound', side: 'right', ratio: 0.3, key: 'ok', label: 'available' },
            { id: 'p-unique-dup', kind: 'outbound', side: 'bottom', ratio: 0.5, key: 'dup', label: 'duplicate' },
          ],
          lockAspectRatio: true,
          color: 'warning',
          data: { step: 'validate-uniqueness', layer: 'backend', action: 'duplicate-check' },
        },
        {
          id: 'n-create-otp',
          type: 'create-otp',
          title: 'Security: Create OTP Challenge',
          icon: 'fa-solid fa-shield-keyhole',
          shape: 'rectangle',
          position: { x: 1490, y: 200 },
          size: { width: 260, height: 84 },
          inboundPorts: [
            { id: 'p-create-otp-in', kind: 'inbound', side: 'left', ratio: 0.5, key: 'in', label: 'available' },
          ],
          outboundPorts: [
            { id: 'p-create-otp-out', kind: 'outbound', side: 'right', ratio: 0.5, key: 'out', label: 'challenge id' },
          ],
          color: 'secondary',
          data: { step: 'create-otp', layer: 'security', action: 'otp-generate' },
        },
        {
          id: 'n-send-otp',
          type: 'send-otp',
          title: 'Integration: Dispatch OTP',
          icon: 'fa-solid fa-message-sms',
          shape: 'rectangle',
          position: { x: 1780, y: 200 },
          size: { width: 190, height: 80 },
          inboundPorts: [{ id: 'p-send-in', kind: 'inbound', side: 'left', ratio: 0.5, key: 'in', label: 'available' }],
          outboundPorts: [
            { id: 'p-send-sent', kind: 'outbound', side: 'right', ratio: 0.5, key: 'sent', label: 'OTP sent' },
            { id: 'p-send-fail', kind: 'outbound', side: 'bottom', ratio: 0.5, key: 'fail', label: 'send failed' },
          ],
          color: 'secondary',
          data: { step: 'send-otp', layer: 'integration', action: 'sms-or-email' },
        },
        {
          id: 'n-ui-enter-otp',
          type: 'ui-enter-otp',
          title: 'UI: Enter OTP',
          icon: 'fa-solid fa-mobile-screen',
          shape: 'ellipse',
          position: { x: 2070, y: 190 },
          size: { width: 200, height: 95 },
          inboundPorts: [
            { id: 'p-ui-enter-otp-in', kind: 'inbound', side: 'left', ratio: 0.5, key: 'in', label: 'OTP sent' },
          ],
          outboundPorts: [
            { id: 'p-ui-enter-otp-out', kind: 'outbound', side: 'right', ratio: 0.5, key: 'out', label: 'submit OTP' },
          ],
          color: 'primary',
          data: { step: 'ui-enter-otp', layer: 'ui', action: 'collect-otp' },
        },
        {
          id: 'n-verify-otp',
          type: 'verify-otp',
          title: 'Backend: Verify OTP',
          icon: 'fa-solid fa-shield-check',
          shape: 'ellipse',
          position: { x: 2330, y: 175 },
          size: { width: 220, height: 105 },
          inboundPorts: [
            { id: 'p-verify-in', kind: 'inbound', side: 'left', ratio: 0.5, key: 'in', label: 'submitted' },
            {
              id: 'p-verify-retry',
              kind: 'inbound',
              side: 'top',
              ratio: 0.5,
              key: 'retry',
              label: 'retry',
              allowMultiple: true,
            },
          ],
          outboundPorts: [
            { id: 'p-verify-ok', kind: 'outbound', side: 'right', ratio: 0.2, key: 'ok', label: 'verified' },
            { id: 'p-verify-wrong', kind: 'outbound', side: 'right', ratio: 0.5, key: 'wrong', label: 'wrong' },
            { id: 'p-verify-exp', kind: 'outbound', side: 'right', ratio: 0.8, key: 'exp', label: 'expired' },
          ],
          color: 'primary',
          data: { step: 'verify-otp', layer: 'backend', action: 'otp-verify' },
        },
        {
          id: 'n-fraud-check',
          type: 'fraud-check',
          title: 'Security: Fraud Check',
          icon: 'fa-solid fa-user-shield',
          shape: 'diamond',
          position: { x: 2620, y: 150 },
          size: { width: 160, height: 160 },
          inboundPorts: [{ id: 'p-fraud-in', kind: 'inbound', side: 'left', ratio: 0.5, key: 'in', label: 'verified' }],
          outboundPorts: [
            { id: 'p-fraud-ok', kind: 'outbound', side: 'right', ratio: 0.4, key: 'ok', label: 'clean' },
            { id: 'p-fraud-risk', kind: 'outbound', side: 'bottom', ratio: 0.5, key: 'risk', label: 'high risk' },
          ],
          lockAspectRatio: true,
          color: 'warning',
          data: { step: 'fraud-check', layer: 'security', action: 'risk-score' },
        },
        {
          id: 'n-create-user',
          type: 'create-user',
          title: 'Backend: Create User Account',
          icon: 'fa-solid fa-user-plus',
          shape: 'rounded-rectangle',
          position: { x: 2890, y: 145 },
          size: { width: 220, height: 90 },
          inboundPorts: [
            { id: 'p-create-in', kind: 'inbound', side: 'left', ratio: 0.5, key: 'in', label: 'verified' },
          ],
          outboundPorts: [
            { id: 'p-create-ok', kind: 'outbound', side: 'right', ratio: 0.5, key: 'ok', label: 'created' },
            { id: 'p-create-fail', kind: 'outbound', side: 'bottom', ratio: 0.5, key: 'fail', label: 'db failed' },
          ],
          color: 'success',
          data: { step: 'create-user', layer: 'backend', action: 'users-insert' },
        },
        {
          id: 'n-create-profile',
          type: 'create-profile',
          title: 'Backend: Create Profile',
          icon: 'fa-solid fa-id-card',
          shape: 'rounded-rectangle',
          position: { x: 3180, y: 145 },
          size: { width: 220, height: 90 },
          inboundPorts: [
            { id: 'p-profile-in', kind: 'inbound', side: 'left', ratio: 0.5, key: 'in', label: 'user id' },
          ],
          outboundPorts: [
            { id: 'p-profile-out', kind: 'outbound', side: 'right', ratio: 0.5, key: 'out', label: 'profile id' },
          ],
          color: 'success',
          data: { step: 'create-profile', layer: 'backend', action: 'profiles-insert' },
        },
        {
          id: 'n-publish-event',
          type: 'publish-event',
          title: 'Integration: Publish UserRegistered',
          icon: 'fa-solid fa-bullhorn',
          shape: 'rectangle',
          position: { x: 3470, y: 150 },
          size: { width: 270, height: 84 },
          inboundPorts: [
            { id: 'p-publish-in', kind: 'inbound', side: 'left', ratio: 0.5, key: 'in', label: 'profile ready' },
          ],
          outboundPorts: [
            { id: 'p-publish-out', kind: 'outbound', side: 'right', ratio: 0.5, key: 'out', label: 'published' },
          ],
          color: 'secondary',
          data: { step: 'publish-event', layer: 'integration', action: 'event-bus' },
        },
        {
          id: 'n-token',
          type: 'issue-token',
          title: 'Issue Session Token',
          icon: 'fa-solid fa-key',
          shape: 'rectangle',
          position: { x: 3790, y: 150 },
          size: { width: 190, height: 80 },
          inboundPorts: [{ id: 'p-token-in', kind: 'inbound', side: 'left', ratio: 0.5, key: 'in', label: 'created' }],
          outboundPorts: [
            { id: 'p-token-out', kind: 'outbound', side: 'right', ratio: 0.5, key: 'out', label: 'token' },
          ],
          color: 'secondary',
          data: { step: 'issue-token', layer: 'backend', action: 'auth-token' },
        },
        {
          id: 'n-end-success',
          type: 'end-success',
          title: 'End: Success',
          icon: 'fa-solid fa-circle-check',
          shape: 'circle',
          position: { x: 4050, y: 140 },
          size: { width: 98, height: 98 },
          inboundPorts: [
            { id: 'p-end-success-in', kind: 'inbound', side: 'left', ratio: 0.5, key: 'in', label: 'done' },
          ],
          outboundPorts: [],
          color: 'success',
          data: { step: 'end-success', layer: 'orchestration', action: 'completed' },
        },
        {
          id: 'n-end-failed',
          type: 'end-failed',
          title: 'End: Failed',
          icon: 'fa-solid fa-circle-xmark',
          shape: 'circle',
          position: { x: 2720, y: 500 },
          size: { width: 98, height: 98 },
          inboundPorts: [
            {
              id: 'p-end-failed-in',
              kind: 'inbound',
              side: 'left',
              ratio: 0.5,
              key: 'in',
              label: 'failed',
              allowMultiple: true,
            },
          ],
          outboundPorts: [],
          color: 'danger',
          data: { step: 'end-failed', layer: 'orchestration', action: 'failed' },
        },
      ],
      connectors: [
        {
          id: 'c-start-input',
          sourceNodeId: 'n-start',
          sourcePortId: 'p-start-out',
          targetNodeId: 'n-input',
          targetPortId: 'p-input-in',
          color: 'success',
          data: { transition: 'start' },
        },
        {
          id: 'c-input-ui-validate',
          sourceNodeId: 'n-input',
          sourcePortId: 'p-input-out',
          targetNodeId: 'n-ui-validate',
          targetPortId: 'p-ui-validate-in',
          color: 'primary',
          data: { transition: 'ui-validate' },
        },
        {
          id: 'c-ui-validate-rate',
          sourceNodeId: 'n-ui-validate',
          sourcePortId: 'p-ui-validate-out',
          targetNodeId: 'n-rate-limit',
          targetPortId: 'p-rate-in',
          color: 'primary',
          data: { transition: 'api-call' },
        },
        {
          id: 'c-rate-unique',
          sourceNodeId: 'n-rate-limit',
          sourcePortId: 'p-rate-ok',
          targetNodeId: 'n-unique',
          targetPortId: 'p-unique-in',
          color: 'success',
          data: { transition: 'allowed' },
        },
        {
          id: 'c-rate-failed',
          sourceNodeId: 'n-rate-limit',
          sourcePortId: 'p-rate-limited',
          targetNodeId: 'n-end-failed',
          targetPortId: 'p-end-failed-in',
          color: 'danger',
          data: { transition: 'rate-limited' },
        },
        {
          id: 'c-unique-create-otp',
          sourceNodeId: 'n-unique',
          sourcePortId: 'p-unique-ok',
          targetNodeId: 'n-create-otp',
          targetPortId: 'p-create-otp-in',
          color: 'success',
          data: { transition: 'available' },
        },
        {
          id: 'c-unique-failed',
          sourceNodeId: 'n-unique',
          sourcePortId: 'p-unique-dup',
          targetNodeId: 'n-end-failed',
          targetPortId: 'p-end-failed-in',
          color: 'danger',
          data: { transition: 'duplicate' },
        },
        {
          id: 'c-create-otp-send',
          sourceNodeId: 'n-create-otp',
          sourcePortId: 'p-create-otp-out',
          targetNodeId: 'n-send-otp',
          targetPortId: 'p-send-in',
          color: 'secondary',
          data: { transition: 'challenge-ready' },
        },
        {
          id: 'c-send-ui-enter',
          sourceNodeId: 'n-send-otp',
          sourcePortId: 'p-send-sent',
          targetNodeId: 'n-ui-enter-otp',
          targetPortId: 'p-ui-enter-otp-in',
          color: 'secondary',
          data: { transition: 'otp-sent' },
        },
        {
          id: 'c-send-failed',
          sourceNodeId: 'n-send-otp',
          sourcePortId: 'p-send-fail',
          targetNodeId: 'n-end-failed',
          targetPortId: 'p-end-failed-in',
          color: 'danger',
          data: { transition: 'send-failed' },
        },
        {
          id: 'c-ui-enter-verify',
          sourceNodeId: 'n-ui-enter-otp',
          sourcePortId: 'p-ui-enter-otp-out',
          targetNodeId: 'n-verify-otp',
          targetPortId: 'p-verify-in',
          color: 'primary',
          data: { transition: 'submit-otp' },
        },
        {
          id: 'c-verify-fraud',
          sourceNodeId: 'n-verify-otp',
          sourcePortId: 'p-verify-ok',
          targetNodeId: 'n-fraud-check',
          targetPortId: 'p-fraud-in',
          color: 'success',
          data: { transition: 'verified' },
        },
        {
          id: 'c-verify-wrong',
          sourceNodeId: 'n-verify-otp',
          sourcePortId: 'p-verify-wrong',
          targetNodeId: 'n-verify-otp',
          targetPortId: 'p-verify-retry',
          color: 'warning',
          data: { transition: 'wrong-retry' },
        },
        {
          id: 'c-verify-exp',
          sourceNodeId: 'n-verify-otp',
          sourcePortId: 'p-verify-exp',
          targetNodeId: 'n-end-failed',
          targetPortId: 'p-end-failed-in',
          color: 'danger',
          data: { transition: 'expired' },
        },
        {
          id: 'c-fraud-create',
          sourceNodeId: 'n-fraud-check',
          sourcePortId: 'p-fraud-ok',
          targetNodeId: 'n-create-user',
          targetPortId: 'p-create-in',
          color: 'success',
          data: { transition: 'clean' },
        },
        {
          id: 'c-fraud-risk',
          sourceNodeId: 'n-fraud-check',
          sourcePortId: 'p-fraud-risk',
          targetNodeId: 'n-end-failed',
          targetPortId: 'p-end-failed-in',
          color: 'danger',
          data: { transition: 'high-risk' },
        },
        {
          id: 'c-create-profile',
          sourceNodeId: 'n-create-user',
          sourcePortId: 'p-create-ok',
          targetNodeId: 'n-create-profile',
          targetPortId: 'p-profile-in',
          color: 'success',
          data: { transition: 'user-created' },
        },
        {
          id: 'c-profile-event',
          sourceNodeId: 'n-create-profile',
          sourcePortId: 'p-profile-out',
          targetNodeId: 'n-publish-event',
          targetPortId: 'p-publish-in',
          color: 'secondary',
          data: { transition: 'profile-created' },
        },
        {
          id: 'c-event-token',
          sourceNodeId: 'n-publish-event',
          sourcePortId: 'p-publish-out',
          targetNodeId: 'n-token',
          targetPortId: 'p-token-in',
          color: 'secondary',
          data: { transition: 'event-published' },
        },
        {
          id: 'c-create-failed',
          sourceNodeId: 'n-create-user',
          sourcePortId: 'p-create-fail',
          targetNodeId: 'n-end-failed',
          targetPortId: 'p-end-failed-in',
          color: 'danger',
          data: { transition: 'db-failed' },
        },
        {
          id: 'c-token-success',
          sourceNodeId: 'n-token',
          sourcePortId: 'p-token-out',
          targetNodeId: 'n-end-success',
          targetPortId: 'p-end-success-in',
          color: 'success',
          data: { transition: 'token-issued' },
        },
      ],
    };
  }

  private pushLog(line: string): void {
    const ts = new Date().toLocaleTimeString();
    this.eventLog.update((rows) => [...rows.slice(-120), `[${ts}] ${line}`]);
  }
}

//#endregion
