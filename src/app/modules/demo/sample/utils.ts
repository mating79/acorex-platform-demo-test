import { AXPWidgetsList } from '@acorex-platform/framework-shared/core';
import { AXButtonClickEvent } from '@acorex/cdk/common';

export function getListPropertyOptions() {
  const options = {
    // 📊 Data Configuration
    dataSource: [
      {
        id: 1,
        name: 'احمد محمدی',
        email: 'ahmad@example.com',
        phone: '09123456789',
        age: 28,
        isActive: true,
        joinDate: '2023-01-15',
        salary: 5000000,
        department: 'IT',
        avatar: 'https://avatar.example.com/ahmad.jpg',
      },
      {
        id: 2,
        name: 'فاطمه حسینی',
        email: 'fateme@example.com',
        phone: '09123456788',
        age: 32,
        isActive: false,
        joinDate: '2022-06-20',
        salary: 6500000,
        department: 'HR',
        avatar: 'https://avatar.example.com/fateme.jpg',
      },
      {
        id: 3,
        name: 'علی اکبری',
        email: 'ali@example.com',
        phone: '09123456787',
        age: 25,
        isActive: true,
        joinDate: '2024-03-10',
        salary: 4200000,
        department: 'Finance',
        avatar: 'https://avatar.example.com/ali.jpg',
      },
      {
        id: 4,
        name: 'مریم صادقی',
        email: 'maryam@example.com',
        phone: '09123456786',
        age: 29,
        isActive: true,
        joinDate: '2023-09-05',
        salary: 7200000,
        department: 'IT',
        avatar: 'https://avatar.example.com/maryam.jpg',
      },
    ],

    // 📋 Columns Configuration با انواع مختلف Widget
    columns: [
      {
        name: 'avatar',
        title: 'تصویر',
        width: '80px',
        widget: {
          type: 'avatar',
          options: {
            size: 'small',
            shape: 'circle',
          },
        },
      },
      {
        name: 'name',
        title: 'نام و نام خانوادگی',
        width: '200px',
        widget: {
          type: AXPWidgetsList.Editors.TextBox,
          options: {
            readonly: true,
            style: { fontWeight: 'bold' },
          },
        },
      },
      {
        name: 'email',
        title: 'ایمیل',
        width: '180px',
        widget: {
          type: AXPWidgetsList.Editors.ContactBox,
          options: {
            type: 'email',
          },
        },
      },
      {
        name: 'phone',
        title: 'تلفن',
        width: '140px',
        widget: {
          type: AXPWidgetsList.Editors.ContactBox,
          options: {
            type: 'phone',
          },
        },
      },
      {
        name: 'age',
        title: 'سن',
        width: '80px',
        widget: {
          type: AXPWidgetsList.Editors.NumberBox,
          options: {
            readonly: true,
            suffix: 'سال',
          },
        },
      },
      {
        name: 'salary',
        title: 'حقوق',
        width: '120px',
        widget: {
          type: AXPWidgetsList.Editors.NumberBox,
          options: {
            readonly: true,
            format: 'currency',
            currency: 'IRR',
          },
        },
      },
      {
        name: 'department',
        title: 'دپارتمان',
        width: '100px',
        widget: {
          type: AXPWidgetsList.Editors.SelectBox,
          options: {
            readonly: true,
            dataSource: [
              { id: 'IT', title: 'فناوری اطلاعات' },
              { id: 'HR', title: 'منابع انسانی' },
              { id: 'Finance', title: 'مالی' },
            ],
            valueField: 'id',
            textField: 'title',
          },
        },
      },
      {
        name: 'joinDate',
        title: 'تاریخ پیوستن',
        width: '120px',
        widget: {
          type: AXPWidgetsList.Editors.DateTimeBox,
          options: {
            readonly: true,
            format: 'jYYYY/jMM/jDD',
            calendar: 'jalali',
          },
        },
      },
      {
        name: 'isActive',
        title: 'وضعیت',
        width: '100px',
        widget: {
          type: AXPWidgetsList.Editors.ToggleSwitch,
          options: {
            disabled: true,
            trueText: 'فعال',
            falseText: 'غیرفعال',
            color: 'success',
          },
        },
      },
    ],

    // 🔢 Special Columns
    showIndex: true,
    allowSelection: true,

    // ⚙️ Table Features
    paging: true,
    showFooter: true,
    fetchDataMode: 'auto',

    // 🔄 Loading Configuration
    loading: {
      enabled: false,
      animation: true,
      text: 'در حال بارگذاری اطلاعات...',
    },

    // 🎯 Events Configuration
    events: {
      // کلیک روی ردیف
      onRowClick: (row: any) => {
        console.log('Row clicked:', row);
        // نمایش جزئیات کاربر
        alert(`کاربر انتخاب شده: ${row.name}`);
      },

      // دابل کلیک روی ردیف
      onRowDoubleClick: (row: any) => {
        console.log('Row double clicked:', row);
        // باز کردن صفحه ویرایش
        window.open(`/users/edit/${row.id}`, '_blank');
      },

      // تغییر انتخاب ردیف‌ها
      onSelectionChange: (selectedRows: any[]) => {
        console.log('Selected rows changed:', selectedRows);

        if (selectedRows.length === 0) {
          console.log('هیچ ردیفی انتخاب نشده');
        } else if (selectedRows.length === 1) {
          console.log(`${selectedRows.length} ردیف انتخاب شده: ${selectedRows[0].name}`);
        } else {
          console.log(`${selectedRows.length} ردیف انتخاب شده`);
        }

        // فعال/غیرفعال کردن دکمه‌های عملیات
        const deleteButton = document.getElementById('delete-selected');
        const exportButton = document.getElementById('export-selected');

        if (deleteButton && exportButton) {
          const isDisabled = selectedRows.length === 0;
          deleteButton.setAttribute('disabled', isDisabled.toString());
          exportButton.setAttribute('disabled', isDisabled.toString());
        }
      },

      // تغییر صفحه
      onPageChange: (pageInfo: any) => {
        console.log('Page changed:', pageInfo);
        // بارگذاری داده‌های صفحه جدید
        // loadPageData(pageInfo.pageNumber, pageInfo.pageSize);
      },

      // Row Command Event Handler
      onRowCommand: (event: AXButtonClickEvent) => {
        console.log('event: ', event);
      },
    },

    // 🎯 Row Commands (جدید!)
    rowCommands: [
      // Button Commands (مستقیم)
      {
        name: 'edit',
        text: 'ویرایش',
        icon: 'fa-light fa-edit',
        color: 'primary',
        look: 'outline',
        type: 'button',
      },
    ],
    rowDropdownCommands: [
      {
        name: 'archive',
        text: 'آرشیو',
        icon: 'fa-light fa-archive',

        type: 'dropdown',
      },
      {
        name: 'export',
        text: 'خروجی Excel',
        icon: 'fa-light fa-file-excel',
        type: 'dropdown',
      },
      {
        name: 'duplicate',
        text: 'کپی کردن',
        icon: 'fa-light fa-copy',
        type: 'dropdown',
        disabled: true, // غیرفعال برای غیرفعال‌ها
      },
      {
        name: 'print',
        command: {
          name: 'asdsadasd',
        },
        text: 'چاپ',
        icon: 'fa-light fa-print',
        color: 'success',
        type: 'dropdown',
      },
    ],

    // 🎨 Additional Options
    parentField: undefined, // برای داده‌های hierarchical

    // Custom CSS Classes
    cssClass: 'my-custom-list-widget',

    // Row Styling
    rowStyleFunction: (row: any) => {
      return {
        'inactive-row': !row.isActive,
        'high-salary': row.salary > 6000000,
        'new-employee': new Date(row.joinDate) > new Date('2024-01-01'),
      };
    },
  };
  return options;
}
