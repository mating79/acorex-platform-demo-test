import { AXPDataGenerator } from '@acorex-platform/framework-client/core';

export const USERS = Array.from({ length: 20 }).map((_, i) => {
  const firstName = AXPDataGenerator.firstName();
  const lastName = AXPDataGenerator.lastName();
  return {
    id: AXPDataGenerator.uuid(),
    firstname: firstName,
    lastname: lastName,
    phone: AXPDataGenerator.phone(),
    email: AXPDataGenerator.email(firstName, lastName),
    address: AXPDataGenerator.address(),
    checkbox: 'false',
    contact: 'gmail.com',
    color: '#ffffff',
    // dateTime: AXPDataGenerator.date().toISOString(),
    dateTime: new Date().toISOString(),
    largeText: 'large text',
    number: 12314,
    password: 'password',
    richText: 'rich text',
    select: ['hello', 'goodbye'],
    selectionList: ['hello', 'goodbye'],
    text: 'text',
    toggle: true,
  };
});
