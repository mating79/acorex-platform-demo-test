import { JsonPipe, UpperCasePipe } from '@angular/common';
import { afterNextRender, Component, computed, effect, signal, viewChild, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, fromEvent, Subject } from 'rxjs';

// Acorex Components
import { AXAlertModule } from '@acorex/components/alert';
import { AXBreadcrumbsModule } from '@acorex/components/breadcrumbs';
import { AXButtonModule } from '@acorex/components/button';
import { AXDecoratorModule } from '@acorex/components/decorators';
import {
  AXGridLayoutBuilderModule,
  AXGridLayoutContainerComponent,
  AXGridLayoutEvent,
  AXGridLayoutNode,
  AXGridLayoutOptions,
} from '@acorex/components/grid-layout-builder';
import { AXLabelModule } from '@acorex/components/label';
import { AXNumberBoxModule } from '@acorex/components/number-box';
import { AXSelectBoxModule } from '@acorex/components/select-box';
import { AXSwitchModule } from '@acorex/components/switch';

//#region ---- Responsive Demo Types ----

type Breakpoint = 'sm' | 'md' | 'lg';

interface WidgetLayoutMap {
  id: string;
  lg: AXGridLayoutNode;
  md: AXGridLayoutNode;
  sm: AXGridLayoutNode;
}

interface WidgetData {
  config: WidgetLayoutMap;
  label: string;
}

//#endregion

//#region ---- Responsive Demo Utilities ----

const BP_SM_WIDTH = 576;
const BP_MD_WIDTH = 768;

const getBreakpoint = (): Breakpoint => {
  if (typeof window === 'undefined') return 'lg';
  const w = window.innerWidth;
  if (w <= BP_SM_WIDTH) return 'sm';
  if (w <= BP_MD_WIDTH) return 'md';
  return 'lg';
};

const getColumnsForBp = (bp: Breakpoint): number => {
  switch (bp) {
    case 'sm':
      return 1;
    case 'md':
      return 6;
    case 'lg':
    default:
      return 12;
  }
};

//#endregion

/**
 * Grid Layout Builder Documentation Page
 * Demonstrates the usage and features of the AXGridLayoutBuilder component
 */
@Component({
  templateUrl: './test9.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    FormsModule,
    JsonPipe,
    UpperCasePipe,
    AXSwitchModule,
    AXGridLayoutBuilderModule,
    AXButtonModule,
    AXDecoratorModule,
    AXLabelModule,
    AXSelectBoxModule,
    AXNumberBoxModule,
    AXBreadcrumbsModule,
    AXAlertModule,
  ],
})
export class TestComponent9 {
  //#region ---- Original Demo ----

  // View Child References
  private readonly container = viewChild(AXGridLayoutContainerComponent);

  // Event Subjects
  private readonly addedSubject = new Subject<AXGridLayoutEvent>();
  private readonly changeSubject = new Subject<AXGridLayoutEvent>();
  private readonly removedSubject = new Subject<AXGridLayoutEvent>();

  // State Signals
  readonly rendered = signal(false);
  readonly columns = signal(12);
  readonly move = signal(false);
  readonly resize = signal(false);
  readonly children = signal(1);

  // Grid Configuration
  readonly gridContainer = signal<AXGridLayoutOptions>({
    column: 6,
    cellHeight: 50,
    gap: 7,
    minRow: 1,
    removableSelector: '.ax-grid-layout-trash',
    acceptWidgets: true,
  });

  // Grid Items
  readonly items = signal<AXGridLayoutNode[]>(
    Array.from({ length: 2 }, (_, i) => ({
      id: (i + 1).toString(),
      width: 2,
      height: 2,
    })),
  );

  constructor() {
    this.setupEventStreams();
    this.setupColumnEffect();
    this.setupResponsiveDemo();
  }

  /**
   * Sets up the effect to update columns when rendered
   */
  private setupColumnEffect(): void {
    effect(() => {
      if (this.rendered()) {
        this.container()?.setColumn(this.columns());
      }
    });
  }

  /**
   * Sets up RxJS streams for grid events
   */
  private setupEventStreams(): void {
    this.addedSubject.pipe(distinctUntilChanged()).subscribe(() => {
      console.log('A new item has been added!');
    });

    this.removedSubject.pipe(distinctUntilChanged()).subscribe(() => {
      console.log('Item has been removed from the layout!');
    });
  }

  // Event Handlers
  onAdded(event: AXGridLayoutEvent): void {
    this.addedSubject.next(event);
  }

  onChange(event: AXGridLayoutEvent): void {
    this.changeSubject.next(event);
  }

  onRemoved(event: AXGridLayoutEvent): void {
    this.items.update((items) => items.filter((item) => item.id !== event.nodes[0].id));
    this.removedSubject.next(event);
  }

  // Grid Actions
  setRender(): void {
    this.rendered.set(true);
  }

  clearGrid(): void {
    this.items.set([]);
    console.log('Grid has been cleared!');
  }

  add(): void {
    this.items.update((items) => {
      const maxId = Math.max(...items.map((item) => parseInt(item.id ?? '0', 10)), 0);
      return [...items, { id: (maxId + 1).toString(), width: 2, height: 2 }];
    });
  }

  remove(): void {
    this.items.update((items) => items.slice(0, -1));
  }

  autoArrange(): void {
    this.container()?.compact();
    console.log('Grid has been auto-arranged!');
  }

  setlock(): void {
    if (this.rendered()) {
      this.move.update((current) => !current);
      const isLocked = this.move();
      this.gridContainer.update((config) => ({ ...config, disableDrag: isLocked }));
      console.log(`Grid items move has been ${isLocked ? 'disabled' : 'enabled'}!`);
    }
  }

  setResize(): void {
    if (this.rendered()) {
      this.resize.update((current) => !current);
      const isResizeDisabled = this.resize();
      this.gridContainer.update((config) => ({ ...config, disableResize: isResizeDisabled }));
      console.log(`Grid items resize has been ${isResizeDisabled ? 'disabled' : 'enabled'}!`);
    }
  }

  // Setup draggable elements after render
  readonly #afterRender = afterNextRender(() => {
    this.container()?.setupDraggable('.draggable1');
    this.container()?.setupDraggable('.draggable2');
    this.container()?.setupDraggable('.draggable3');
  });

  //#endregion

  //#region ---- Responsive Breakpoint Demo ----

  /** Current breakpoint from window width */
  readonly responsiveBp = signal<Breakpoint>(getBreakpoint());

  /** True while transitioning between breakpoints — suppresses saves */
  readonly isTransitioning = signal(false);

  /** Event log for the responsive demo */
  readonly responsiveLog = signal<string[]>([]);

  /** Widget data with per-breakpoint layout configs */
  readonly responsiveWidgets = signal<WidgetData[]>([
    {
      label: 'Widget A',
      config: {
        id: 'w-a',
        lg: { id: 'w-a', width: 4, height: 2 },
        md: { id: 'w-a', width: 3, height: 2 },
        sm: { id: 'w-a', width: 1, height: 2 },
      },
    },
    {
      label: 'Widget B',
      config: {
        id: 'w-b',
        lg: { id: 'w-b', width: 4, height: 2 },
        md: { id: 'w-b', width: 3, height: 2 },
        sm: { id: 'w-b', width: 1, height: 2 },
      },
    },
    {
      label: 'Widget C',
      config: {
        id: 'w-c',
        lg: { id: 'w-c', width: 4, height: 2 },
        md: { id: 'w-c', width: 6, height: 3 },
        sm: { id: 'w-c', width: 1, height: 3 },
      },
    },
    {
      label: 'Widget D',
      config: {
        id: 'w-d',
        lg: { id: 'w-d', x: 0, y: 2, width: 6, height: 3 },
        md: { id: 'w-d', x: 0, y: 5, width: 4, height: 2 },
        sm: { id: 'w-d', x: 0, y: 7, width: 1, height: 2 },
      },
    },
    {
      label: 'Widget E',
      config: {
        id: 'w-e',
        lg: { id: 'w-e', x: 6, y: 2, width: 6, height: 3 },
        md: { id: 'w-e', x: 4, y: 5, width: 2, height: 2 },
        sm: { id: 'w-e', x: 0, y: 9, width: 1, height: 2 },
      },
    },
  ]);

  /** Grid options derived from current breakpoint */
  readonly responsiveGridOptions = computed<AXGridLayoutOptions>(() => ({
    column: getColumnsForBp(this.responsiveBp()),
    cellHeight: 60,
    gap: 5,
    float: false,
    minRow: 6,
  }));

  /** Resolved widgets with options for the current breakpoint */
  readonly resolvedWidgets = computed(() => {
    const bp = this.responsiveBp();
    return this.responsiveWidgets().map((w) => ({
      ...w,
      resolvedOptions: w.config[bp],
    }));
  });

  /** Persisted layout dump for debugging */
  readonly layoutDump = computed(() => {
    const bp = this.responsiveBp();
    return this.responsiveWidgets().map((w) => ({
      id: w.config.id,
      label: w.label,
      [bp]: w.config[bp],
    }));
  });

  private responsiveTransitionTimer: ReturnType<typeof setTimeout> | null = null;

  private setupResponsiveDemo(): void {
    if (typeof window === 'undefined') return;
    fromEvent(window, 'resize')
      .pipe(debounceTime(100))
      .subscribe(() => {
        const bp = getBreakpoint();
        if (bp !== this.responsiveBp()) {
          if (this.responsiveTransitionTimer) clearTimeout(this.responsiveTransitionTimer);
          this.isTransitioning.set(true);
          this.responsiveBp.set(bp);
          this.logResponsive(`Breakpoint changed to: ${bp} (${getColumnsForBp(bp)} columns)`);

          this.responsiveTransitionTimer = setTimeout(() => {
            this.isTransitioning.set(false);
            this.responsiveTransitionTimer = null;
          }, 500);
        }
      });
  }

  /** Manually force a breakpoint for testing without resizing the browser */
  forceBreakpoint(bp: Breakpoint): void {
    if (bp === this.responsiveBp()) return;
    if (this.responsiveTransitionTimer) clearTimeout(this.responsiveTransitionTimer);
    this.isTransitioning.set(true);
    this.responsiveBp.set(bp);
    this.logResponsive(`Forced breakpoint to: ${bp} (${getColumnsForBp(bp)} columns)`);

    this.responsiveTransitionTimer = setTimeout(() => {
      this.isTransitioning.set(false);
      this.responsiveTransitionTimer = null;
    }, 500);
  }

  /** Handles grid change events — saves positions to the current breakpoint only */
  onResponsiveGridChange(event: AXGridLayoutEvent): void {
    if (this.isTransitioning()) {
      this.logResponsive(`[BLOCKED] Change during transition — not saved`);
      return;
    }

    const bp = this.responsiveBp();
    const nodes = event.nodes.map(({ element, ...rest }) => rest);

    let hasChanges = false;
    const updated = this.responsiveWidgets().map((widget) => {
      const node = nodes.find((n) => n.id === widget.config.id);
      if (!node) return widget;

      const existing = widget.config[bp];
      if (
        existing?.x === node.x &&
        existing?.y === node.y &&
        existing?.width === node.width &&
        existing?.height === node.height
      ) {
        return widget;
      }

      hasChanges = true;
      return {
        ...widget,
        config: {
          ...widget.config,
          [bp]: { ...widget.config[bp], ...node, id: widget.config.id },
        },
      };
    });

    if (!hasChanges) return;

    this.responsiveWidgets.set(updated);
    this.logResponsive(`Saved positions for breakpoint: ${bp}`);
  }

  private logResponsive(msg: string): void {
    const time = new Date().toLocaleTimeString();
    this.responsiveLog.update((logs) => [`[${time}] ${msg}`, ...logs].slice(0, 20));
  }

  clearResponsiveLog(): void {
    this.responsiveLog.set([]);
  }

  //#endregion
}
