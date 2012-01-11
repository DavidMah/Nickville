(function() {
  var chooseRandomFromList, completeDialogue, continueDialogue, encounterPerson, followDialogue, getPossibleLinks, handleMessage, initializeGameData, setControls, setupPerson, startingSequence, testFunctions, travelToLocation, triggerChatBox;
  $(document).ready(function() {
    testFunctions();
    initializeGameData();
    return setControls();
  });
  testFunctions = function() {
    window.encounterPerson = encounterPerson;
    window.setupPerson = setupPerson;
    window.travelToLocation = travelToLocation;
    return window.getPossibleLinks = getPossibleLinks;
  };
  initializeGameData = function() {
    $.get("gamedata/data.json", function(data) {
      window.game_data = data;
      return startingSequence();
    });
    return window.game_state = {
      location: "Home",
      control: "Free"
    };
  };
  setControls = function() {
    var actions;
    console.log("controls being set");
    actions = {
      32: {
        Chat: continueDialogue
      }
    };
    window.actions = actions;
    return $(document).keypress(function(e) {
      return actions[e.which][window.game_state['control']]();
    });
  };
  followDialogue = function(dialogue) {
    window.game_state['control'] = 'Chat';
    dialogue = dialogue.slice();
    window.dialogue = dialogue;
    return continueDialogue();
  };
  continueDialogue = function() {
    var dialogue;
    dialogue = window.dialogue;
    if (dialogue.length > 0) {
      handleMessage(dialogue[0]);
      return window.dialogue = dialogue.splice(1);
    } else {
      return completeDialogue();
    }
  };
  completeDialogue = function() {};
  handleMessage = function(message) {
    var c, choices, i, _i, _len, _results;
    if (message instanceof Object) {
      choices = message['Choice'];
      i = 0;
      window.choices = choices;
      _results = [];
      for (_i = 0, _len = choices.length; _i < _len; _i++) {
        c = choices[_i];
        console.log("" + i + " -- " + c['Response']);
        _results.push(i += 1);
      }
      return _results;
    } else {
      $("#dialogue_area").text(message);
      return console.log(message);
    }
  };
  encounterPerson = function(location) {
    var person, possible_people;
    possible_people = window.game_data['Locations'][location]['People'];
    person = chooseRandomFromList(possible_people);
    return setupPerson(person);
  };
  getPossibleLinks = function() {
    var possible_links;
    possible_links = window.game_data['Locations'][window.game_state['location']]['Links'];
    console.log(possible_links);
    return possible_links;
  };
  travelToLocation = function(location) {
    console.log("Moving to " + location);
    window.game_state['location'] = location;
    if (Math.random() > 0.4) {
      return encounterPerson(location);
    }
  };
  setupPerson = function(person) {
    var dialogue, possible_dialogue;
    console.log("Encountered " + person);
    possible_dialogue = window.game_data['People'][person]['Dialogue'];
    dialogue = chooseRandomFromList(possible_dialogue);
    return followDialogue(dialogue);
  };
  chooseRandomFromList = function(list) {
    return list[parseInt(Math.random() * list.length)];
  };
  triggerChatBox = function() {
    var visibility, _ref;
    visibility = $("#chatbox").visibility;
    return $("#chatbox").visibility = (_ref = visibility === "hidden") != null ? _ref : {
      "visible": "hidden"
    };
  };
  startingSequence = function() {
    return followDialogue(window.game_data['Starting Sequence']);
  };
}).call(this);
