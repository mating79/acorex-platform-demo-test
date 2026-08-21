
export const formData = {
  id: "test",
  title: "Title",
  node: {
    "type": "block-layout",
    "name": "block-layout1",
    "options": {
      "fontSize": "12px",
      "flexDirection": { "id": "flex-col", "title": "Column" },
      "flexJustifyContent": { "id": "justify-normal" },
      "flexAlignItems": { "id": "items-stretch", "title": "Stretch" },
      "gap": 2,
      "flexWrap": { "id": "flex-nowrap" }
    },
    "children": [
      {
        "type": "qrcode",
        "name": "qrcode1",
        "options": { "size": 200, "content": "{{ context.eval('map.text-editor1') }}", "color": "#005000", "level": "M" }
      },
      {
        "type": "text-editor",
        "name": "text-editor1",
        "options": { "multiple": false, "disabled": false, "hasClearButton": true }
      }
    ]
  }
}