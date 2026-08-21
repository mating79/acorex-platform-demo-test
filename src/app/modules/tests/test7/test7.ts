import { AXButtonModule } from '@acorex/components/button';
import { AXDecoratorModule } from '@acorex/components/decorators';
import { AXPLayoutBuilderService } from '@acorex-platform/framework-client/layout/builder';
import { AXPEntityFormBuilderService } from '@acorex-platform/framework-client/layout/entity';
import { type AXPWidgetNode } from '@acorex-platform/framework-shared/core';
import { AXPWidgetCoreModule } from '@acorex-platform/framework-client/layout/widget-core';

import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'test7',
  template: `
    <div class="flex flex-col items-center justify-center h-screen gap-4">
      <h1 class="text-2xl font-bold text-primary">Step Wizard & Entity Form Example</h1>
      <p class="text-neutral-600">Click the buttons below</p>

      <div class="flex gap-4 flex-wrap justify-center">
        <ax-button color="primary" text="Open Wizard Dialog" size="lg" (onClick)="openWizardDialog()">
          <ax-icon><i class="fa-regular fa-wand-magic-sparkles"></i></ax-icon>
        </ax-button>

        <ax-button color="secondary" text="Build User Update Form Node" size="lg" (onClick)="buildUserFormNode()">
          <ax-icon><i class="fa-regular fa-user-pen"></i></ax-icon>
        </ax-button>
      </div>

      @if (userFormNode()) {
        <div class="w-full max-w-4xl mt-8 p-4">
          <h2 class="text-xl font-semibold mb-4">User Update Form</h2>
          <axp-widgets-container [context]="userFormData()" (onContextChanged)="onContextChanged($event)">
            <ng-container axp-widget-renderer [node]="userFormNode()!" [mode]="'edit'"></ng-container>
          </axp-widgets-container>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AXButtonModule, AXDecoratorModule, AXPWidgetCoreModule],
})
export class Test7Component {
  //#region ----   Services & Dependencies   ----

  private layoutBuilder = inject(AXPLayoutBuilderService);
  private entityFormBuilder = inject(AXPEntityFormBuilderService);

  // Signal to store the built node
  protected userFormNode = signal<AXPWidgetNode | null>(null);
  protected userFormData = signal<Record<string, any> | null>(null);

  //#endregion

  //#region ----   Dialog & Wizard Builder   ----

  /**
   * Open a dialog with step wizard inside
   */
  protected openWizardDialog(): void {
    const x = this.layoutBuilder.create().dialog((dialog) => {
      dialog
        .setTitle('User Registration Wizard')
        .setSize('lg')
        .setCloseButton(true)
        .content((flex) => {
          // ✅ Step wizard inside dialog - showActions will be automatically false
          flex.stepWizard((wizard) => {
            wizard
              .name('registration-wizard')
              .setLook('circular-icon')
              .setLinear(true)
              .setDirection('horizontal')
              .setShowActions(false)
              .setActions({
                previous: { title: 'Back', icon: 'fa-regular fa-arrow-left', color: 'primary' },
                next: { title: 'Continue', icon: 'fa-regular fa-arrow-right', color: 'primary' },
                submit: { title: 'Finish', icon: 'fa-regular fa-check', color: 'success' },
              })
              .setGuards({
                next: async (payload) => {
                  console.log('Next Guard:', payload);
                  console.log(payload.stepContext);
                  // Add validation logic here
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  return true;
                },
                prev: async (payload) => {
                  console.log('Prev Guard:', payload);
                  return true;
                },
              })
              .setEvents({
                onStepChanged: (status) => {
                  console.log('Step Changed:', status);
                },
                onComplete: async (status) => {
                  console.log('Wizard Completed:', status);
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  return true;
                },
              })
              .step('personal-info', 'Personal Info', (step) => {
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
                        field
                          .path('lastName')
                          .textBox({ name: 'lastName', validations: [{ rule: 'required' }] })
                          .layout(1);
                      })
                      .formField('Email', (field) => {
                        field.path('email').textBox({ name: 'email' }).layout(1);
                      })
                      .formField('Phone', (field) => {
                        field.path('phone').textBox({ name: 'phone' }).layout(1);
                      })
                      .formField('Date of Birth', (field) => {
                        field.path('dob').dateTimeBox({ name: 'dob', type: 'date' }).layout(2);
                      })
                      .formField('Address', (field) => {
                        field.path('address').largeTextBox({ name: 'address', rows: 3 }).layout(2);
                      });
                  });
                });
              })
              .step('work-details', 'Work Details', (step) => {
                step
                  .setIcon('fa-regular fa-briefcase')
                  .setSkippable(false)
                  .content((layout) => {
                    layout.fieldset((fieldset) => {
                      fieldset
                        .setTitle('Work Information')
                        .setDescription('Optional - You can skip this step')
                        .setIcon('fa-regular fa-briefcase')
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
                        .formField('Experience', (field) => {
                          field
                            .path('experience')
                            .selectBox({
                              name: 'experience',
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
                        .formField('Start Date', (field) => {
                          field.path('startDate').dateTimeBox({ name: 'startDate', type: 'date' }).layout(1);
                        })
                        .formField('Remote Work', (field) => {
                          field
                            .path('remoteWork')
                            .toggleSwitch({ name: 'remoteWork', label: 'Available for remote work' })
                            .layout(1);
                        });
                    });
                  });
              })
              .step('review', 'Review', (step) => {
                step.setIcon('fa-regular fa-clipboard-check').content((layout) => {
                  layout.panel((panel) => {
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
                          .formField('Phone', (field) => {
                            field.path('phone').textBox({ name: 'phone' }).readonly(true).layout(1);
                          });
                      })
                      .fieldset((fieldset) => {
                        fieldset
                          .setTitle('Work Information')
                          .setIcon('fa-regular fa-briefcase')
                          .setLook('group')
                          .setCols(2)
                          .formField('Job Title', (field) => {
                            field.path('jobTitle').textBox({ name: 'jobTitle' }).readonly(true).layout(1);
                          })
                          .formField('Company', (field) => {
                            field.path('company').textBox({ name: 'company' }).readonly(true).layout(1);
                          });
                      })
                      .panel((innerPanel) => {
                        innerPanel
                          .setCaption('Confirmation')
                          .setLook('flat')
                          .formField('I confirm all information is correct', (field) => {
                            field.path('confirmed').toggleSwitch({ name: 'confirmed' });
                          });
                      });
                  });
                });
              });
          });
        });
      // .show();
    });
    x.show();
  }

  /**
   * Build SecurityManagement.User update form node using build() method
   */
  protected async buildUserFormNode(): Promise<void> {
    try {
      const recordId = '4cb45880-f7fa-45e5-8ab4-224f542c7765';
      const entityFullName = 'SecurityManagement.User';

      // Fetch record data using the public method
      const initialData = await this.entityFormBuilder.getRecordById(entityFullName, recordId);
      this.userFormData.set(initialData);

      // Build the widget node using entity form builder with update interface
      const node = await this.entityFormBuilder.entity(entityFullName).update(initialData).build();

      // Log the node
      console.log('Built User Update Form Node:', node);
      console.log('Node Type:', node.type);
      console.log('Node Options:', node.options);
      console.log('Node Children:', node.children);
      console.log('User Form Data:', initialData);

      // Store node in signal
      this.userFormNode.set(node);
    } catch (error) {
      console.error('Error building user form node:', error);
    }
  }

  /**
   * Handle context changes from the form
   */
  protected onContextChanged(event: any): void {
    console.log('Form Context Changed:', event);
    // this.userFormData.set(event);
  }

  //#endregion
}
