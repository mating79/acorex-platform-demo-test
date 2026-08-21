import {AXPEntity, AXPEntityCommandScope, AXPEntityQueryType, createAllQueryView} from '@acorex-platform/framework-shared/entity';
import { Injector } from '@angular/core';

import { AXDataSource } from '@acorex/cdk/common';
import { AXPWidgetsList } from '@acorex-platform/module-common-client';
import {AXPSystemActionType} from '@acorex-platform/framework-shared/core';
import { entityMasterCrudActions, entityMasterRecordActions } from '@acorex-platform/framework-client/layout/entity';
import { RootConfig } from './const';
import { AXMSampleEntityService } from './sample.service';

export async function factory(injector: Injector): Promise<AXPEntity | null> {
  const dataService = injector.get(AXMSampleEntityService);

  const entityDef: AXPEntity = {
    module: RootConfig.module.name,
    name: RootConfig.entities.sample.name,
    title: RootConfig.entities.sample.title,
    icon: RootConfig.entities.sample.icon,
    parentKey: 'parenId',
    formats: {
      individual: RootConfig.entities.sample.title,
      plural: RootConfig.entities.sample.titlePlural,
    },
    plugins: [{ name: 'history' }, { name: 'lock' }, { name: 'compare' }],
    groups: [
      {
        id: 'personal-info',
        title: '@general:terms.interface.personal-info',
      },
      {
        id: 'address-info',
        title: '@general:terms.interface.address-info',
      },
    ],
    properties: [
      {
        name: 'firstName',
        title: '@general:terms.contact.first-name',
        groupId: 'personal-info',
        options: {
          filter: {
            advance: {
              enabled: true,
            },
            inline: {
              enabled: true,
            },
          },
          sort: {
            enabled: true,
          },
        },
        schema: {
          dataType: 'string',
          interface: {
            type: AXPWidgetsList.Editors.TextBox,
          },
        },
        validations: [
          {
            rule: 'required',
          },
        ],
      },
      {
        name: 'parenId',
        title: '@general:terms.contact.paren-id',
        groupId: 'personal-info',
        schema: {
          dataType: 'string',
          interface: {
            type: AXPWidgetsList.Editors.LookupBox,
            options: {
              valueField: 'id',
              textField: 'firstName',
              entity: `${RootConfig.module.name}.${RootConfig.entities.sample.name}`,
            },
          },
        },
      },
      {
        name: 'lastName',
        title: '@general:terms.contact.last-name',
        groupId: 'personal-info',
        options: {
          filter: {
            advance: {
              enabled: true,
            },
            inline: {
              enabled: true,
            },
          },
          sort: {
            enabled: true,
          },
        },
        schema: {
          dataType: 'string',
          interface: {
            type: AXPWidgetsList.Editors.TextBox,
          },
        },
        validations: [
          {
            rule: 'required',
          },
        ],
      },
      {
        name: 'email',
        title: '@general:terms.contact.email',
        groupId: 'personal-info',
        options: {
          filter: {
            advance: {
              enabled: true,
            },
          },
          sort: {
            enabled: true,
          },
        },
        schema: {
          dataType: 'string',
          interface: {
            type: AXPWidgetsList.Editors.TextBox,
          },
        },
        validations: [
          {
            rule: 'required',
          },
        ],
      },
      {
        name: 'phoneNumber',
        title: '@general:terms.contact.phone',
        groupId: 'personal-info',
        options: {
          filter: {
            advance: {
              enabled: true,
            },
          },
        },
        schema: {
          dataType: 'string',
          interface: {
            type: AXPWidgetsList.Editors.TextBox,
          },
        },
      },
      {
        name: 'age',
        title: '@general:terms.contact.age',
        groupId: 'personal-info',
        options: {
          filter: {
            advance: {
              enabled: true,
            },
          },
        },
        schema: {
          dataType: 'number',
          interface: {
            type: AXPWidgetsList.Editors.NumberBox,
            options: {
              format: {
                name: 'number',
              },
              seprator: ',',
            },
          },
        },
      },
      {
        name: 'dateOfBirth',
        title: '@general:terms.contact.date-of-birth',
        groupId: 'personal-info',
        options: {
          filter: {
            advance: {
              enabled: true,
            },
          },
          sort: {
            enabled: true,
          },
        },
        schema: {
          dataType: 'datetime',
          interface: {
            type: AXPWidgetsList.Editors.DateTimeBox,
          },
        },
      },
      {
        name: 'street',
        title: '@general:terms.address.street',
        groupId: 'address-info',
        schema: {
          dataType: 'string',
          interface: {
            type: AXPWidgetsList.Editors.LargeTextBox,
            options: {
              rows: 3,
            },
          },
        },
      },
      {
        name: 'timeDuration',
        title: '@general:terms.address.timeDuration',
        groupId: 'address-info',
        schema: {
          dataType: 'string',
          interface: {
            type: AXPWidgetsList.Editors.TimeDuration,
            options: {
              from: { title: 'HOUR' },
              to: { title: 'MINUTE' },
            },
          },
        },
      },
      {
        name: 'country',
        title: '@general:terms.address.country',
        groupId: 'address-info',
        options: {
          filter: {
            advance: {
              enabled: true,
            },
          },
          sort: {
            enabled: true,
          },
        },
        schema: {
          dataType: 'string',
          interface: {
            type: AXPWidgetsList.Editors.SelectBox,
            options: {
              valueField: 'code',
              textField: 'name',
              allowSearch: true,
              dataSource: new AXDataSource({
                load: (e) => {
                  console.log('load countries', { e });
                  return new Promise<any>((resolve) =>
                    resolve({
                      total: 100,
                      items: [
                        { code: 'US', name: 'United States' },
                        { code: 'UK', name: 'United Kingdom' },
                        { code: 'CA', name: 'Canada' },
                        { code: 'AU', name: 'Australia' },
                        { code: 'DE', name: 'Germany' },
                        { code: 'FR', name: 'France' },
                        { code: 'IR', name: 'Iran' },
                      ],
                    }),
                  );
                },
                pageSize: 100,
              }),
            },
          },
        },
        validations: [
          {
            rule: 'required',
          },
        ],
      },
      {
        name: 'city',
        title: '@general:terms.address.city',
        groupId: 'address-info',
        options: {
          filter: {
            advance: {
              enabled: true,
            },
          },
          sort: {
            enabled: true,
          },
        },
        schema: {
          dataType: 'string',
          visible: '{{context.eval("country")?.code != "US"}}',
          interface: {
            type: AXPWidgetsList.Editors.SelectBox,
            options: {
              valueField: 'id',
              textField: 'name',
              filter: {
                field: 'country',
                operator: { type: 'equal' },
                value: '{{context.eval("country")?.code}}',
              },
              allowSearch: true,
              dataSource: new AXDataSource({
                load: (e) => {
                  console.log('load cities', { e });
                  const cities = [
                    { id: '1', name: 'New York' },
                    { id: '2', name: 'London' },
                    { id: '3', name: 'Toronto' },
                    { id: '4', name: 'Sydney' },
                    { id: '5', name: 'Berlin' },
                    { id: '6', name: 'Paris' },
                    { id: '7', name: 'Tehran' },
                  ];
                  return new Promise<any>((resolve) =>
                    resolve({
                      total: cities.length,
                      items: cities,
                    }),
                  );
                },
                pageSize: 100,
              }),
            },
            triggers: [
              {
                event: "{{ events.context('country') }}",
                action: `{{ widget.call("clear");console.log("country changed",context.eval("country")) }}`,
              },
            ],
          },
        },
        validations: [
          {
            rule: 'required',
          },
        ],
      },
      {
        name: 'postalCode',
        title: '@general:terms.address.postal-code',
        groupId: 'address-info',
        schema: {
          dataType: 'string',
          interface: {
            type: AXPWidgetsList.Editors.TextBox,
          },
        },
      },
    ],
    columns: [
      { name: 'firstName' },
      { name: 'lastName' },
      { name: 'email' },
      { name: 'phoneNumber' },
      { name: 'age' },
      { name: 'country' },
      { name: 'city' },
      { name: 'timeDuration' },
    ],
    commands: {
      create: {
        execute: async (data: any) => {
          console.log({ data });
          const res = await dataService.insertOne(data);
          return { id: res };
        },
      },
      delete: {
        execute: async (id: any) => {
          return await dataService.deleteOne(id);
        },
      },
      update: {
        execute: async (data: any) => {
          return await dataService.updateOne(data.id, data);
        },
      },
    },
    queries: {
      byKey: {
        execute: async (id: string) => {
          return await dataService.getOne(id);
        },
        type: AXPEntityQueryType.Single,
      },
      list: {
        execute: async (e: any) => {
          return await dataService.query(e);
        },
        type: AXPEntityQueryType.List,
      },
    },
    interfaces: {
      master: {
        create: {
          sections: [
            {
              id: 'personal-info',
            },
            {
              id: 'address-info',
            },
          ],
          properties: [
            {
              name: 'parenId',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'firstName',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'lastName',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'email',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'phoneNumber',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'age',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'dateOfBirth',
              layout: {
                positions: {
                  lg: {
                    colSpan: 12,
                  },
                },
              },
            },
            {
              name: 'timeDuration',
              layout: {
                positions: {
                  lg: {
                    colSpan: 12,
                  },
                },
              },
            },
            {
              name: 'street',
              layout: {
                positions: {
                  lg: {
                    colSpan: 12,
                  },
                },
              },
            },
            {
              name: 'country',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'city',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'postalCode',
              layout: {
                positions: {
                  lg: {
                    colSpan: 12,
                  },
                },
              },
            },
          ],
        },
        update: {
          sections: [
            {
              id: 'personal-info',
            },
            {
              id: 'address-info',
            },
          ],
          properties: [
            {
              name: 'parenId',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'firstName',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'lastName',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'email',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'phoneNumber',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'age',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'dateOfBirth',
              layout: {
                positions: {
                  lg: {
                    colSpan: 12,
                  },
                },
              },
            },
            {
              name: 'timeDuration',
              layout: {
                positions: {
                  lg: {
                    colSpan: 12,
                  },
                },
              },
            },
            {
              name: 'street',
              layout: {
                positions: {
                  lg: {
                    colSpan: 12,
                  },
                },
              },
            },
            {
              name: 'country',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'city',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'postalCode',
              layout: {
                positions: {
                  lg: {
                    colSpan: 12,
                  },
                },
              },
            },
          ],
        },
        single: {
          title: '{{firstName}} {{lastName}}',

          sections: [
            {
              id: 'personal-info',
              layout: {
                positions: {
                  lg: {
                    colSpan: 12,
                  },
                },
              },
            },
            {
              id: 'address-info',
              layout: {
                positions: {
                  lg: {
                    colSpan: 12,
                  },
                },
              },
            },
          ],
          properties: [
            {
              name: 'parenId',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'firstName',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'lastName',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'email',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'phoneNumber',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'age',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'dateOfBirth',
              layout: {
                positions: {
                  lg: {
                    colSpan: 12,
                  },
                },
              },
            },
            {
              name: 'timeDuration',
              layout: {
                positions: {
                  lg: {
                    colSpan: 12,
                  },
                },
              },
            },
            {
              name: 'street',
              layout: {
                positions: {
                  lg: {
                    colSpan: 12,
                  },
                },
              },
            },
            {
              name: 'country',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'city',
              layout: {
                positions: {
                  lg: {
                    colSpan: 6,
                  },
                },
              },
            },
            {
              name: 'postalCode',
              layout: {
                positions: {
                  lg: {
                    colSpan: 12,
                  },
                },
              },
            },
          ],
          actions: [...entityMasterRecordActions()],
        },
        list: {
          actions: [
            ...entityMasterCrudActions(),
            {
              command: 'Entity:Edit',
              priority: 'secondary',
              scope: AXPEntityCommandScope.Individual,
              title: 'Edit',
              type: AXPSystemActionType.Update,
            },
          ],
          views: [
            createAllQueryView({
              sorts: [{ name: 'firstName', dir: 'asc' }],
            }),
          ],
        },
      },
    },
  };
  return entityDef;
}
