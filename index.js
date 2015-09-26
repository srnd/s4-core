var EventEmitter = require('events').EventEmitter,
    util = require('util');

function Core(){
  EventEmitter.call(this);

  var _this = this;

  this.CONNECTOR_TYPES = {
    TYPE_MESSAGE_SENDER: 1,
    TYPE_MESSAGE_HANDLER: 2
  };

  this.commands = [];

  this.triggers = [];

  this.intents = {};

  this.handleMessage = function(){ };
  this.sendMessage = function(){ };

  this.setConnector = function(type, connector){
    _this.emit("connector-loaded", {type: type, connector: connector});

    switch(type){
      case this.CONNECTOR_TYPES.TYPE_MESSAGE_SENDER:
        this.sendMessage = connector.sendMessage;
        break;
      case this.CONNECTOR_TYPES.TYPE_MESSAGE_HANDLER:
        this.handleMessage = connector.handleMessage;
        this.handleMessage();
        break;
      default:
        throw new Error("Connector type unknown");
        break;
    }
  }

  this.setIntent = function(username, channel, callback){
    this.intents[username] = {channel: channel, callback: callback};
  };

  this.processMessage = function(message, channel, username, extra){
    // intents are prioritized
    if(this.intents[username] && this.intents[username].channel === channel){
      var intent = this.intents[username];

      // callback success
      if(intent.callback(message, channel, username) === true){
        this.intents[username] = undefined;
      }
    }else{
      var command = false;

      this.commands.forEach(function(c){
        var regex = RegExp("^" + c.trigger + "\\b");
        if(regex.test(message)){
          command = true;
          message = message.substr(c.trigger.length+1);
          var args = message.split(" ");
          try{
            c.action(message, args, channel, username, extra);
            _this.emit("command-fired", {command: c}) // You shouldn't use the emmiter to capture data from commands.
          }catch(e){
            console.log("s4 Core error:", {error: e, channel: channel, command: c});
          }
        }
      });

      if(!command){
        this.triggers.forEach(function(t){
          if(t.trigger.test(message)){
            command = true;
            var matches = new RegExp(t.trigger).exec(message);
            t.action(message, matches, channel, username, extra);
            _this.emit("trigger-fired", {trigger: t}); // You shouldn't use the emmiter to capture data from triggers.
          }
        });
      }

      if(!command){
        _this.emit("unknown-response", {message: message, channel: channel, username: username, extra: extra});
      }
    }
  }

  this.addCommand = function(trigger, help, action){
    this.commands.push({trigger: trigger, action: action, help: help});
    _this.emit("command-added", {trigger: trigger, action: action, help: help});
    return this.commands;
  }

  this.addTrigger = function(trigger, action){
    this.triggers.push({trigger: trigger, action: action});
    _this.emit("trigger-added", {trigger: trigger, action: action});
    return this.triggers;
  }

  return this;
}

util.inherits(Core, EventEmitter);

module.exports = Core;
