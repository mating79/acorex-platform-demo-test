
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';

import { AXButtonModule } from '@acorex/components/button';
import { AXPLayoutBuilderService, AXPLayoutRendererComponent } from '@acorex-platform/framework-client/layout/builder';
import { type AXPWidgetNode } from '@acorex-platform/framework-shared/core';
import { AXPWidgetCoreModule } from '@acorex-platform/framework-client/layout/widget-core';
import { AXPTokenDefinitionService } from '@acorex-platform/framework-client/common';
import { AXPExpressionEvaluatorService } from '@acorex-platform/framework-client/core';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [AXButtonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './test.component.html',
})
export class TestComponent {

  private readonly layoutBuilder = inject(AXPLayoutBuilderService);
  private readonly tokenService = inject(AXPTokenDefinitionService);
  private readonly expressionEvaluator = inject(AXPExpressionEvaluatorService);
  myLayoutBuilder?: AXPWidgetNode | undefined;

  context = signal<any>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    birthDate: '1990-01-01',
    gender: 'Male',
    address: '123 Main St, Anytown, USA',
  });

  ngOnInit() {
    this.buildLayout();

    // Evaluate expression with token
    this.expressionEvaluator.evaluate('TODAY is: {{ tokens.get("now") }}').then((x) => {
      console.log('show log : ', x);
    });
    // Get token value directly
    this.tokenService.getValue('now').then((x) => {
      console.log('show log : ', x);
    });
  }

  buildLayout() {
    try {
      const builder = this.layoutBuilder.create();

      // 📋 Registration Form with Fieldsets
      builder.flex((mainContainer) => {
        mainContainer.mode('edit').setDirection('column').setGap('10px');
        //.setPadding('20px');

        // 👤 Personal Information Fieldset
        mainContainer.fieldset((personalFieldset) => {
          personalFieldset
            //.path('personal-information')
            .setTitle('Personal Information')
            .setDescription('Please provide your basic personal details')
            .setIcon('fa-light fa-user')
            .setCols(12)
            .formField('First Name', (field) => {
              field.path('firstName');
              field.layout(2);
              field.textBox({
                placeholder: 'Enter your first name',
                validations: [
                  {
                    rule: 'required',
                    message: 'First name is required',
                  },
                ],
              });
            })
            .formField('Last Name', (field) => {
              field.layout(10);
              field.textBox({
                placeholder: 'Enter your last name',
              });
            })
            .formField('Email Address', (field) => {
              field.layout(6);
              field.visible(false);
              field.textBox({
                placeholder: 'Enter your email address',
                prefix: '📧',
              });
            })
            .formField('Phone Number', (field) => {
              field.layout(6);
              field.textBox({
                placeholder: 'Enter your phone number',
                prefix: '📱',
              });
            })
            .formField('Date of Birth', (field) => {
              field.layout(6);
              field.dateTimeBox({
                type: 'date',
                placeholder: 'Select your birth date',
              });
            })
            .formField('Gender', (field) => {
              field.layout(6);
              field.selectBox({
                placeholder: 'Select your gender',
                dataSource: ['Male', 'Female', 'Other', 'Prefer not to say'],
              });
            });
        });

        // 🏠 Address Information Fieldset
        mainContainer.fieldset((addressFieldset) => {
          addressFieldset
            .setTitle('Address Information')
            .setDescription('Your current residential address')
            .setIcon('fa-light fa-home')
            .setCols(2)
            .visible(false)
            .formField('Street Address', (field) => {
              field.textBox({
                placeholder: 'Enter your street address',
              });
            })
            .formField('City', (field) => {
              field.textBox({
                placeholder: 'Enter your city',
              });
            })
            .formField('State/Province', (field) => {
              field.selectBox({
                placeholder: 'Select your state/province',
                dataSource: ['California', 'New York', 'Texas', 'Florida', 'Illinois'],
              });
            })
            .formField('ZIP/Postal Code', (field) => {
              field.textBox({
                placeholder: 'Enter ZIP/postal code',
              });
            })
            .formField('Country', (field) => {
              field.selectBox({
                placeholder: 'Select your country',
                dataSource: ['United States', 'Canada', 'United Kingdom', 'Australia'],
              });
            });
        });

        // 🔐 Account Security Fieldset
        mainContainer.fieldset((securityFieldset) => {
          securityFieldset
            .setTitle('Account Security')
            .setDescription('Set up your account credentials')
            .setIcon('fa-light fa-lock')
            .visible(false)
            .setCols(2)
            .formField('Password', (field) => {
              field.passwordBox({
                placeholder: 'Enter password (min 8 characters)',
                revealToggle: true,
              });
            })
            .formField('Confirm Password', (field) => {
              field.passwordBox({
                placeholder: 'Confirm your password',
                revealToggle: true,
              });
            })
            .formField('Two-Factor Authentication', (field) => {
              field.toggleSwitch({
                label: 'Enable Two-Factor Authentication',
              });
            });
        });

        // 🎯 Preferences Fieldset
        mainContainer.fieldset((preferencesFieldset) => {
          preferencesFieldset
            .setTitle('Preferences')
            .visible(false)
            .setDescription('Customize your experience')
            .setIcon('fa-light fa-cog')
            .setCols(2)
            .formField('Preferred Language', (field) => {
              field.selectBox({
                placeholder: 'Select your preferred language',
                dataSource: ['English', 'Spanish', 'French', 'German', 'Italian'],
              });
            })
            .formField('Time Zone', (field) => {
              field.selectBox({
                placeholder: 'Select your time zone',
                dataSource: ['UTC-8 (PST)', 'UTC-5 (EST)', 'UTC+0 (GMT)', 'UTC+1 (CET)'],
              });
            })
            .formField('Notification Preferences', (field) => {
              field.selectionList({
                dataSource: ['Email Notifications', 'SMS Notifications', 'Push Notifications', 'Marketing Emails'],
                multiple: true,
              });
            })
            .formField('Theme Color', (field) => {
              field.colorBox({
                format: 'hex',
                showPalette: true,
                showAlpha: false,
              });
            });
        });

        // 📝 Additional Information Fieldset
        mainContainer.fieldset((additionalFieldset) => {
          additionalFieldset
            .setTitle('Additional Information')
            .setDescription('Tell us more about yourself (optional)')
            .setIcon('fa-light fa-info-circle')
            .formField('About Yourself', (field) => {
              field.largeTextBox({
                placeholder: 'Tell us about yourself...',
                rows: 4,
              });
            })
            .formField('Additional Notes', (field) => {
              field.richText({
                placeholder: 'Additional notes or comments...',
              });
            });
        });
      });

      // Build the layout
      const definition = builder.build();
      this.myLayoutBuilder = definition;
    } catch (error: any) {
      console.error('❌ Registration form creation failed:', error);
      console.error('Error details:', error.message);
    }
  }

  async handleClick(layout: AXPLayoutRendererComponent) {
    const context = layout.getContext();
    const result = await layout.validate();
    console.log('Form validation result:', result);
    console.log('Form context:', context);
  }

  async showDialog() {
    try {
      const dialogRef = await this.layoutBuilder
        .create()
        .dialog((dialog) => {
          dialog
            .setTitle('User Registration Dialog')
            .setContext({
              firstName: 'arash',
              lastName: '',
              email: '',
              phone: '',
              age: null,
            })

            .setActions((actions) => {
              actions.cancel('Cancel Registration');
            });
        })
        .show();

      const formData = dialogRef.context();
      const action = dialogRef.action();

      dialogRef.close();

      console.log('Dialog action:', action);
      console.log('Dialog form data:', formData);

      if (action === 'cancel') {
        console.log('❌ User cancelled registration');
        return;
      }

      if (action === 'submit') {
        console.log('✅ User completed registration with data:', formData);
      }

      if (action === 'save-draft') {
        console.log('💾 User saved draft with data:', formData);
      }
    } catch (error) {
      console.error('Failed to show dialog:', error);
    }
  }
}
