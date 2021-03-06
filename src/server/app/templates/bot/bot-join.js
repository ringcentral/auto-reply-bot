export const botJoinTemp = `
{
  "type": "AdaptiveCard",
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "version": "1.3",
  "fallbackText": "Auto Reply bot: {{fallbackText}}",
  "body": [
    {{title}},
    {
      "type": "TextBlock",
      "text": "{{desc}}",
      "wrap": true
    },
    {
      "type": "ColumnSet",
      "columns": [
        {{feedback}}
        {{actions}}
      ]
    }
  ]
}
`
