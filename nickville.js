(function() {
  var changeControlState, chooseRandomFromList, completeDialogue, continueDialogue, encounterPerson, enterChatState, enterFreeState, followDialogue, getPossibleLinks, handleMessage, initializeGameData, setControls, setIndicatorArea, setLocationImage, setTravelList, setupPerson, startingSequence, testFunctions, travelToLocation, triggerChatBox;
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
    $('.container').hide();
    $.get("gamedata/data.json", function(data) {
      window.game_data = data;
      return startingSequence();
    });
    window.game_state = {
      location: "Home",
      control: "Free"
    };
    $('#background_image').error(function() {
      return $(this).hide();
    });
    return $('#background_image').hide();
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
      var action;
      action = actions[e.which][window.game_state['control']];
      if (action !== void 0) {
        return action();
      }
    });
  };
  changeControlState = function(state) {
    window.game_state['control'] = state;
    switch (state) {
      case 'Chat':
        console.log("moving to Chat State");
        return enterChatState();
      case 'Free':
        console.log("moving to Free State");
        return enterFreeState();
    }
  };
  enterChatState = function() {
    $('.free').hide();
    return $('.chat').show();
  };
  enterFreeState = function() {
    $('.chat').hide();
    return $('.free').show();
  };
  followDialogue = function(dialogue) {
    changeControlState('Chat');
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
  completeDialogue = function() {
    return changeControlState('Free');
  };
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
  getPossibleLinks = function() {
    var possible_links;
    possible_links = window.game_data['Locations'][window.game_state['location']]['Links'];
    console.log(possible_links);
    return possible_links;
  };
  travelToLocation = function(location, encounter_possible) {
    if (encounter_possible == null) {
      encounter_possible = true;
    }
    console.log("Moving to " + location);
    window.game_state['location'] = location;
    setIndicatorArea(location);
    if (encounter_possible && Math.random() > 0.4) {
      encounterPerson(location);
    }
    setTravelList(location);
    return setLocationImage(location);
  };
  setTravelList = function(location) {
    var container, item, l, link_container, links, _i, _len, _results;
    container = $('#travel_links').text("");
    links = window.game_data['Locations'][location]['Links'];
    _results = [];
    for (_i = 0, _len = links.length; _i < _len; _i++) {
      l = links[_i];
      link_container = $(document.createElement('div'));
      link_container.addClass('link_container');
      item = $(document.createElement('button'));
      item.addClass('link box');
      item.text(l);
      item.click(function() {
        return travelToLocation($(this).text());
      });
      link_container.append(item);
      _results.push(container.append(link_container));
    }
    return _results;
  };
  setLocationImage = function(location) {
    try {
      $('#background_image').attr('src', "images/" + location + ".jpg");
      return $('#background_image').show();
    } catch (error) {
      return $('#background_image').hide();
    }
  };
  encounterPerson = function(location) {
    var person, possible_people;
    possible_people = window.game_data['Locations'][location]['People'];
    if (possible_people !== null) {
      person = chooseRandomFromList(possible_people);
      return setupPerson(person);
    }
  };
  setupPerson = function(person) {
    var dialogue, possible_dialogue;
    console.log("Encountered " + person);
    setIndicatorArea(person);
    possible_dialogue = window.game_data['People'][person]['Dialogue'];
    dialogue = chooseRandomFromList(possible_dialogue);
    return followDialogue(dialogue);
  };
  chooseRandomFromList = function(list) {
    return list[parseInt(Math.random() * list.length)];
  };
  setIndicatorArea = function(message) {
    return $('#indicator_area').text(message);
  };
  triggerChatBox = function() {
    var visibility, _ref;
    visibility = $("#chatbox").visibility;
    return $("#chatbox").visibility = (_ref = visibility === "hidden") != null ? _ref : {
      "visible": "hidden"
    };
  };
  startingSequence = function() {
    travelToLocation('The Apartment', false);
    return followDialogue(window.game_data['Starting Sequence']);
  };
}).call(this);
