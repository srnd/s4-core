| s4 Core |
|:---------------:|
| ![](https://horner.tj/c/446) |

s4 Core is the engine that powers StudentRND's s4. We turned it into its own module for use with s4 connectors, they can listen for and send messages with their specified services. These connectors require little to no configuration, all you need to worry about is your bot's behavior.

## Examples

### Slack <-> Telegram Echo Command

First:

```bash
npm install s4-slack s4-telegram
```

```javascript
var s4 = require('s4-core'),
    slackConnector = require('s4-slack')("YOUR-SLACK-API-KEY"),
    telegramConnector = require('s4-telegram')("YOUR-TELEGRAM-API-KEY"),
    bot = new s4();

bot.setConnector(bot.CONNECTOR_TYPES.TYPE_MESSAGE_SENDER, telegramConnector); // send messages to Telegram
bot.setConnector(bot.CONNECTOR_TYPES.TYPE_MESSAGE_HANDLER, slackConnector); // receive messages from Slack
// you can switch those two connectors around and receive from Telegram instead of Slack!

// this is documented here: https://github.com/StudentRND/s4/wiki/Commands
bot.addCommand("echo", "Echo the specified text.", function(message, args, channel, username){
  bot.sendMessage("some-telegram-chat-id", username + " said " + message + " on Slack!");
});
```
