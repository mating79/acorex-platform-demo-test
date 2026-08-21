import { AXButtonModule } from '@acorex/components/button';
import { AXTextBoxModule } from '@acorex/components/text-box';
import { AXTextAreaModule } from '@acorex/components/text-area';
import { AXFormModule } from '@acorex/components/form';
import { AXLabelModule } from '@acorex/components/label';
import { AXPWidgetFieldConfiguratorComponent } from '@acorex-platform/framework-client/layout/components';
import { type AXPWidgetNode } from '@acorex-platform/framework-shared/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'test4',
  templateUrl: './test4.component.html',
  styleUrl: './test4.component.css',
  styles: `@reference '@acorex/styles/themes/default.css';

    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    AXButtonModule,
    AXTextBoxModule,
    AXTextAreaModule,
    AXFormModule,
    AXLabelModule,
    AXPWidgetFieldConfiguratorComponent,
  ],
  standalone: true,
})
export class Test4Component {

  //#region ----   Field Configuration   ----

  protected fieldName = signal('voltage');
  protected fieldTitle = signal('Voltage');
  protected fieldDescription = signal('Electrical voltage measurement');

  protected widgetConfig = signal<AXPWidgetNode>({
    type: '',
    options: {},
  });

  //#endregion

  //#region ----   Actions   ----

  protected saveConfiguration(): void {
    const config = {
      name: this.fieldName(),
      title: this.fieldTitle(),
      description: this.fieldDescription(),
      widget: this.widgetConfig(),
    };

    console.log('Field Configuration:', config);
    console.log('Widget Type:', this.widgetConfig().type);
    console.log('Widget Options:', this.widgetConfig().options);
  }

  protected resetConfiguration(): void {
    this.fieldName.set('');
    this.fieldTitle.set('');
    this.fieldDescription.set('');
    this.widgetConfig.set({ type: '', options: {} });
  }

  //#endregion
}
