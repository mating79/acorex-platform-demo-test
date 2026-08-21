import { AXButtonModule } from '@acorex/components/button';
import { AXDecoratorModule } from '@acorex/components/decorators';
import { AXPLayoutBuilderService } from '@acorex-platform/framework-client/layout/builder';
import { type AXPFileListItem, type AXPWidgetNode } from '@acorex-platform/framework-shared/core';
import {
  AXPWidgetContainerComponent,
  AXPWidgetCoreModule,
  AXPWidgetCoreService,
} from '@acorex-platform/framework-client/layout/widget-core';
import type { AXPStepWizardGuardPayload, AXPStepWizardStatus } from '@acorex-platform/framework-client/layout/widgets';

import { AfterViewInit, Component, inject, Injector, signal, viewChild, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'test6',
  template: `
    <axp-widgets-container #widgetsContainer>
      <div class="flex flex-col gap-4 p-4">
        <!-- File Viewer Widget -->
        <div class="rounded border p-4">
          <h3 class="mb-2 text-lg font-semibold">File Viewer (edit)</h3>
          <ng-container axp-widget-renderer [node]="fileViewerNode" [mode]="'edit'"></ng-container>
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-2 text-lg font-semibold">File Viewer (view)</h3>
          <ng-container axp-widget-renderer [node]="fileViewerViewNode" [mode]="'view'"></ng-container>
        </div>

        <!-- Step Wizard Widget -->
        <ng-container axp-widget-renderer [node]="wizardNode" [mode]="'edit'"></ng-container>

        <!-- Status Display -->
        <div class="p-3 rounded bg-primary-lightest text-primary">
          <strong>Current Step:</strong> {{ currentStepTitle() }} ({{ currentStepIndex() + 1 }} / {{ totalSteps() }})
        </div>
      </div>
    </axp-widgets-container>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AXPWidgetCoreModule, AXButtonModule, AXDecoratorModule],
})
export class Test6Component implements AfterViewInit {
  //#region ----   Services & Dependencies   ----

  private layoutBuilder = inject(AXPLayoutBuilderService);
  private injector = inject(Injector);
  private widgetService?: AXPWidgetCoreService;

  //#endregion

  //#region ----   ViewChild References   ----

  private widgetsContainer = viewChild<any>(AXPWidgetContainerComponent);

  //#endregion

  //#region ----   Lifecycle Hooks   ----

  async ngAfterViewInit(): Promise<void> {
    // Get the widget service from the container's injector
    setTimeout(async () => {
      const containerElement = this.widgetsContainer();
      if (containerElement) {
        // Get the injector from the container component
        const containerInjector = containerElement.injector;
        if (containerInjector) {
          this.widgetService = containerInjector.get(AXPWidgetCoreService);
          console.log('widget service', this.widgetService);

          if (this.widgetService) {
            // Wait for the wizard widget to be registered
            await this.widgetService.waitForWidget('step-wizard', 2000);
            console.log('wizard widget registered');
            console.log({ widget: this.widgetService.getWidget('step-wizard') });
            this.updateStatus();
          }
        }
      }
    }, 100);
  }

  //#endregion

  //#region ----   File Viewer Demo   ----

  private readonly fileViewerSampleFiles: AXPFileListItem[] = [
    {
      id: 'fv-1',
      name: 'sample-image.jpg',
      size: 245_760,
      status: 'attached',
      source: {
        kind: 'url',
        value: 'https://picsum.photos/1200/800?random=11',
      },
    },
    {
      id: 'fv-2',
      name: 'sample-document.pdf',
      size: 132_640,
      status: 'attached',
      source: {
        kind: 'url',
        value: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },
    },
    {
      id: 'fv-3',
      name: 'sample-video.mp4',
      size: 1_048_576,
      status: 'attached',
      source: {
        kind: 'url',
        value: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      },
    },
    {
      id: 'fv-4',
      name: 'sample-audio.mp3',
      size: 524_288,
      status: 'attached',
      source: {
        kind: 'url',
        value: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
      },
    },
  ];

  fileViewerNode: AXPWidgetNode = {
    type: 'file-viewer',
    name: 'file-viewer-demo',
    path: 'fileViewerDemo',
    defaultValue: this.fileViewerSampleFiles,
    options: {
      thumbnail: true,
      downloadButton: true,
      fullScreenButton: true,
      height: '75vh',
      allowUpload: true,
      allowUploadTypes: ['image/*', 'application/pdf', 'video/*', 'audio/*'],
    },
  };

  fileViewerViewNode: AXPWidgetNode = {
    type: 'file-viewer',
    name: 'file-viewer-view-demo',
    path: 'fileViewerViewDemo',
    defaultValue: this.fileViewerSampleFiles,
    options: {
      thumbnail: true,
      downloadButton: true,
      fullScreenButton: true,
      height: '60vh',
    },
  };

  //#endregion

  //#region ----   Step Wizard Node (built with layoutBuilder, not in dialog)   ----

  /**
   * Widget node for step wizard, created via LayoutBuilder API (like test7 but not in dialog)
   */
  wizardNode: AXPWidgetNode = this.layoutBuilder
    .create()
    .flex((flex) => {
      flex
        .setDirection('column')
        .setGap('16px')
        .stepWizard((wizard) => {
          wizard
            .name('step-wizard-widget')
            .setLook('circular-icon')
            .setLinear(true)
            .setDirection('horizontal')
            .setShowActions(true)
            .setActions({
              previous: { title: 'Back', icon: 'fa-regular fa-arrow-left', color: 'primary' },
              next: { title: 'Continue', icon: 'fa-regular fa-arrow-right', color: 'primary' },
              submit: { title: 'Submit', icon: 'fa-regular fa-check', color: 'success' },
            })
            .setGuards({
              next: (payload: AXPStepWizardGuardPayload) => {
                console.log('next-guard', payload.index, payload.step.id);
                return true;
              },
              prev: async (payload: AXPStepWizardGuardPayload) => {
                console.log('prev-guard', payload.index, payload.step.id);
                return Promise.resolve(true);
              },
            })
            .setEvents({
              onStepChanged: (status: AXPStepWizardStatus) => console.log('step-changed', status),
              onComplete: async (status: AXPStepWizardStatus) => {
                console.log('completed', status);
                await new Promise((resolve) => setTimeout(resolve, 1000));
              },
            })
            .step('info', 'Info', (step) => {
              step.setIcon('fa-regular fa-user').content((layout) => {
                layout.fieldset((fieldset) => {
                  fieldset
                    .setTitle('Personal Information')
                    .setDescription('Please enter your basic information')
                    .setIcon('fa-regular fa-user')
                    .setCols(2)
                    .formField('First Name', (field) => {
                      field.path('firstName').textBox({ name: 'firstName' }).layout(1);
                    })
                    .formField('Last Name', (field) => {
                      field.path('lastName').textBox({ name: 'lastName' }).layout(1);
                    })
                    .formField('Email', (field) => {
                      field.path('email').textBox({ name: 'email' }).layout(1);
                    })
                    .formField('Phone Number', (field) => {
                      field.path('phoneNumber').textBox({ name: 'phoneNumber' }).layout(1);
                    })
                    .formField('Date of Birth', (field) => {
                      field.path('dateOfBirth').dateTimeBox({ name: 'dateOfBirth' }).layout(2);
                    })
                    .formField('Address', (field) => {
                      field.path('address').largeTextBox({ name: 'address', rows: 3 }).layout(2);
                    });
                });
              });
            })
            .step('details', 'Details', (step) => {
              step
                .setIcon('fa-regular fa-list')
                .setSkippable(true)
                .content((layout) => {
                  layout.fieldset((fieldset) => {
                    fieldset
                      .setTitle('Additional Details')
                      .setDescription('Optional information (this step is skippable)')
                      .setIcon('fa-regular fa-list')
                      .setCols(2)
                      .formField('Job Title', (field) => {
                        field.path('jobTitle').textBox({ name: 'jobTitle' }).layout(1);
                      })
                      .formField('Company', (field) => {
                        field.path('company').textBox({ name: 'company' }).layout(1);
                      })
                      .formField('Department', (field) => {
                        field
                          .path('department')
                          .selectBox({
                            name: 'department',
                            valueField: 'id',
                            textField: 'name',
                            dataSource: [
                              { id: 1, name: 'Engineering' },
                              { id: 2, name: 'Marketing' },
                              { id: 3, name: 'Sales' },
                              { id: 4, name: 'HR' },
                            ],
                          })
                          .layout(1);
                      })
                      .formField('Experience Level', (field) => {
                        field
                          .path('experienceLevel')
                          .selectBox({
                            name: 'experienceLevel',
                            valueField: 'value',
                            textField: 'text',
                            dataSource: [
                              { value: 'junior', text: 'Junior (0-2 years)' },
                              { value: 'mid', text: 'Mid-level (3-5 years)' },
                              { value: 'senior', text: 'Senior (6+ years)' },
                            ],
                          })
                          .layout(1);
                      })
                      .formField('Skills', (field) => {
                        field.path('skills').largeTextBox({ name: 'skills', rows: 4 }).layout(2);
                      })
                      .formField('Available for Remote Work', (field) => {
                        field.path('remoteWork').toggleSwitch({ name: 'remoteWork' }).layout(1);
                      })
                      .formField('Preferred Start Date', (field) => {
                        field.path('startDate').dateTimeBox({ name: 'startDate' }).layout(1);
                      });
                  });
                });
            })
            .step('review', 'Review', (step) => {
              step.setIcon('fa-regular fa-clipboard-check').content((layout) => {
                layout.flex((flex) => {
                  flex
                    .setDirection('column')
                    .setGap('16px')
                    .panel((panel) => {
                      panel
                        .setCaption('Review Your Information')
                        .setIcon('fa-regular fa-clipboard-check')
                        .setLook('outline')
                        .fieldset((fieldset) => {
                          fieldset
                            .setTitle('Personal Information')
                            .setIcon('fa-regular fa-user')
                            .setLook('group')
                            .setCols(2)
                            .formField('First Name', (field) => {
                              field.path('firstName').textBox({ name: 'firstName' }).readonly(true).layout(1);
                            })
                            .formField('Last Name', (field) => {
                              field.path('lastName').textBox({ name: 'lastName' }).readonly(true).layout(1);
                            })
                            .formField('Email', (field) => {
                              field.path('email').textBox({ name: 'email' }).readonly(true).layout(1);
                            })
                            .formField('Phone Number', (field) => {
                              field.path('phoneNumber').textBox({ name: 'phoneNumber' }).readonly(true).layout(1);
                            });
                        })
                        .fieldset((fieldset) => {
                          fieldset
                            .setTitle('Additional Details')
                            .setIcon('fa-regular fa-list')
                            .setLook('group')
                            .setCols(2)
                            .formField('Job Title', (field) => {
                              field.path('jobTitle').textBox({ name: 'jobTitle' }).readonly(true).layout(1);
                            })
                            .formField('Company', (field) => {
                              field.path('company').textBox({ name: 'company' }).readonly(true).layout(1);
                            })
                            .formField('Department', (field) => {
                              field
                                .path('department')
                                .selectBox({
                                  name: 'department',
                                  valueField: 'id',
                                  textField: 'name',
                                  dataSource: [
                                    { id: 1, name: 'Engineering' },
                                    { id: 2, name: 'Marketing' },
                                    { id: 3, name: 'Sales' },
                                    { id: 4, name: 'HR' },
                                  ],
                                })
                                .readonly(true)
                                .layout(1);
                            })
                            .formField('Experience Level', (field) => {
                              field
                                .path('experienceLevel')
                                .selectBox({
                                  name: 'experienceLevel',
                                  valueField: 'value',
                                  textField: 'text',
                                  dataSource: [
                                    { value: 'junior', text: 'Junior (0-2 years)' },
                                    { value: 'mid', text: 'Mid-level (3-5 years)' },
                                    { value: 'senior', text: 'Senior (6+ years)' },
                                  ],
                                })
                                .readonly(true)
                                .layout(1);
                            });
                        })
                        .panel((innerPanel) => {
                          innerPanel
                            .setCaption('Confirmation')
                            .setLook('flat')
                            .formField('I confirm that all information is correct', (field) => {
                              field.path('confirmed').toggleSwitch({ name: 'confirmed' });
                            });
                        });
                    });
                });
              });
            });
        });
    })
    .build();

  //#endregion

  //#region ----   Step Content Builders   ----

  /**
   * Creates content for Info step with personal information form
   */
  private createInfoStepContent(): AXPWidgetNode {
    return this.layoutBuilder
      .create()
      .fieldset((fieldset) => {
        fieldset
          .setTitle('Personal Information')
          .setDescription('Please enter your basic information')
          .setIcon('fa-regular fa-user')
          .setCols(2)
          .formField('First Name', (field) => {
            field.path('firstName').textBox({ name: 'firstName' }).layout(1);
          })
          .formField('Last Name', (field) => {
            field.path('lastName').textBox({ name: 'lastName' }).layout(1);
          })
          .formField('Email', (field) => {
            field.path('email').textBox({ name: 'email' }).layout(1);
          })
          .formField('Phone Number', (field) => {
            field.path('phoneNumber').textBox({ name: 'phoneNumber' }).layout(1);
          })
          .formField('Date of Birth', (field) => {
            field.path('dateOfBirth').dateTimeBox({ name: 'dateOfBirth' }).layout(2);
          })
          .formField('Address', (field) => {
            field.path('address').largeTextBox({ name: 'address', rows: 3 }).layout(2);
          });
      })
      .build();
  }

  /**
   * Creates content for Details step with additional information
   */
  private createDetailsStepContent(): AXPWidgetNode {
    return this.layoutBuilder
      .create()
      .fieldset((fieldset) => {
        fieldset
          .setTitle('Additional Details')
          .setDescription('Optional information (this step is skippable)')
          .setIcon('fa-regular fa-list')
          .setCols(2)
          .formField('Job Title', (field) => {
            field.path('jobTitle').textBox({ name: 'jobTitle' }).layout(1);
          })
          .formField('Company', (field) => {
            field.path('company').textBox({ name: 'company' }).layout(1);
          })
          .formField('Department', (field) => {
            field
              .path('department')
              .selectBox({
                name: 'department',
                valueField: 'id',
                textField: 'name',
                dataSource: [
                  { id: 1, name: 'Engineering' },
                  { id: 2, name: 'Marketing' },
                  { id: 3, name: 'Sales' },
                  { id: 4, name: 'HR' },
                ],
              })
              .layout(1);
          })
          .formField('Experience Level', (field) => {
            field
              .path('experienceLevel')
              .selectBox({
                name: 'experienceLevel',
                valueField: 'value',
                textField: 'text',
                dataSource: [
                  { value: 'junior', text: 'Junior (0-2 years)' },
                  { value: 'mid', text: 'Mid-level (3-5 years)' },
                  { value: 'senior', text: 'Senior (6+ years)' },
                ],
              })
              .layout(1);
          })
          .formField('Skills', (field) => {
            field.path('skills').largeTextBox({ name: 'skills', rows: 4 }).layout(2);
          })
          .formField('Available for Remote Work', (field) => {
            field.path('remoteWork').toggleSwitch({ name: 'remoteWork' }).layout(1);
          })
          .formField('Preferred Start Date', (field) => {
            field.path('startDate').dateTimeBox({ name: 'startDate' }).layout(1);
          });
      })
      .build();
  }

  /**
   * Creates content for Review step with summary information
   */
  private createReviewStepContent(): AXPWidgetNode {
    return this.layoutBuilder
      .create()
      .flex((flex) => {
        flex
          .setDirection('column')
          .setGap('16px')
          .panel((panel) => {
            panel
              .setCaption('Review Your Information')
              .setIcon('fa-regular fa-clipboard-check')
              .setLook('outline')
              .fieldset((fieldset) => {
                fieldset
                  .setTitle('Personal Information')
                  .setIcon('fa-regular fa-user')
                  .setLook('group')
                  .setCols(2)
                  .formField('First Name', (field) => {
                    field.path('firstName').textBox({ name: 'firstName' }).readonly(true).layout(1);
                  })
                  .formField('Last Name', (field) => {
                    field.path('lastName').textBox({ name: 'lastName' }).readonly(true).layout(1);
                  })
                  .formField('Email', (field) => {
                    field.path('email').textBox({ name: 'email' }).readonly(true).layout(1);
                  })
                  .formField('Phone Number', (field) => {
                    field.path('phoneNumber').textBox({ name: 'phoneNumber' }).readonly(true).layout(1);
                  });
              })
              .fieldset((fieldset) => {
                fieldset
                  .setTitle('Additional Details')
                  .setIcon('fa-regular fa-list')
                  .setLook('group')
                  .setCols(2)
                  .formField('Job Title', (field) => {
                    field.path('jobTitle').textBox({ name: 'jobTitle' }).readonly(true).layout(1);
                  })
                  .formField('Company', (field) => {
                    field.path('company').textBox({ name: 'company' }).readonly(true).layout(1);
                  })
                  .formField('Department', (field) => {
                    field
                      .path('department')
                      .selectBox({
                        name: 'department',
                        valueField: 'id',
                        textField: 'name',
                        dataSource: [
                          { id: 1, name: 'Engineering' },
                          { id: 2, name: 'Marketing' },
                          { id: 3, name: 'Sales' },
                          { id: 4, name: 'HR' },
                        ],
                      })
                      .readonly(true)
                      .layout(1);
                  })
                  .formField('Experience Level', (field) => {
                    field
                      .path('experienceLevel')
                      .selectBox({
                        name: 'experienceLevel',
                        valueField: 'value',
                        textField: 'text',
                        dataSource: [
                          { value: 'junior', text: 'Junior (0-2 years)' },
                          { value: 'mid', text: 'Mid-level (3-5 years)' },
                          { value: 'senior', text: 'Senior (6+ years)' },
                        ],
                      })
                      .readonly(true)
                      .layout(1);
                  });
              })
              .panel((innerPanel) => {
                innerPanel
                  .setCaption('Confirmation')
                  .setLook('flat')
                  .formField('I confirm that all information is correct', (field) => {
                    field.path('confirmed').toggleSwitch({ name: 'confirmed' });
                  });
              });
          });
      })
      .build();
  }

  //#endregion

  //#region ----   Computed Properties   ----

  /**
   * Get current step index
   */
  protected currentStepIndex = signal(0);

  /**
   * Get total number of steps
   */
  protected totalSteps = signal(3);

  /**
   * Get current step title
   */
  protected currentStepTitle = signal('Info');

  /**
   * Check if current step is first
   */
  protected isFirstStep(): boolean {
    const api = this.getWizardApi();
    return api?.getStatus()?.isFirst ?? true;
  }

  /**
   * Check if current step is last
   */
  protected isLastStep(): boolean {
    const api = this.getWizardApi();
    return api?.getStatus()?.isLast ?? false;
  }

  //#endregion

  //#region ----   Custom Button Handlers   ----

  /**
   * Handle previous button click
   */
  protected async handlePrevious(): Promise<void> {
    const api = this.getWizardApi();
    if (api) {
      await api.previous();
      this.updateStatus();
    }
  }

  /**
   * Handle next button click
   */
  protected async handleNext(): Promise<void> {
    const api = this.getWizardApi();
    if (api) {
      await api.next();
      this.updateStatus();
    }
  }

  /**
   * Handle submit button click
   */
  protected async handleSubmit(): Promise<void> {
    const api = this.getWizardApi();
    if (api) {
      await api.submit();
      console.log('Form submitted successfully!');
    }
  }

  /**
   * Handle reset button click
   */
  protected handleReset(): void {
    const api = this.getWizardApi();
    if (api) {
      api.setIndex(0);
      this.updateStatus();
      console.log('Wizard reset to first step');
    }
  }

  //#endregion

  //#region ----   Utility Methods   ----

  /**
   * Get wizard API from widget reference
   */
  private getWizardApi(): any {
    if (!this.widgetService) {
      return null;
    }
    const widget = this.widgetService.getWidget('step-wizard-widget');
    return widget?.api?.();
  }

  /**
   * Update status signals based on current wizard state
   */
  private updateStatus(): void {
    const api = this.getWizardApi();
    if (api) {
      const status = api.getStatus();
      this.currentStepIndex.set(status.index);
      this.totalSteps.set(status.total);
      this.currentStepTitle.set(status.currentStep?.title ?? '');
    }
  }

  //#endregion
}
