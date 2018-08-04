
var NUM_HEADER_ROWS = 2;
var MAX_OUTPUT_ROWS = 100 + NUM_HEADER_ROWS;

// Sequence ID for numbering events.
var _seqId = 1;

// True if the current row is a 'keydown' event.
// This is used to set the background for the entire row when 'keydown' events are
// highlighted.
var _isKeydown = false;

function clearChildren(e) {
	while (e.firstChild !== null) {
		e.removeChild(e.firstChild);
	}
}

function setText(e, text) {
	clearChildren(e);
	e.appendChild(document.createTextNode(text));
}

function setUserAgentText() {
	var userAgent = navigator.userAgent;
	uaDiv = document.getElementById("useragent");
	setText(uaDiv, userAgent);
}

function addEventListener(obj, etype, handler) {
	if (obj.addEventListener) {
		obj.addEventListener(etype, handler, false);
	} else if (obj.attachEvent) {
		obj.attachEvent("on" + etype, handler);
	} else {
		obj["on" + etype] = handler;
	}
}

function init() {
	setUserAgentText();
	resetTable();

	var input = document.getElementById("input");
	addEventListener(input, "keydown", onKeyDown);
	addEventListener(input, "keypress", onKeyPress);
	addEventListener(input, "keyup", onKeyUp);
	addEventListener(input, "textInput", onTextInput);
	addEventListener(input, "textinput", onTextInput);	// For IE9
	addEventListener(input, "beforeinput", onBeforeInput);
	addEventListener(input, "input", onInput);
	addEventListener(input, "compositionstart", onCompositionStart);
	addEventListener(input, "compositionupdate", onCompositionUpdate);
	addEventListener(input, "compositionend", onCompositionEnd);
}

function onKeyDown(e) {
    _isKeydown = true;
	handleKeyEvent("keydown", e);
    _isKeydown = false;
}

function onKeyPress(e) {
	handleKeyEvent("keypress", e);
}

function onKeyUp(e) {
	handleKeyEvent("keyup", e);
}

function onTextInput(e) {
	handleInputEvent("textinput", e);
}

function onBeforeInput(e) {
	handleInputEvent("beforeinput", e);
}

function onInput(e) {
	handleInputEvent("input", e);
}

function onCompositionStart(e) {
	handleCompositionEvent("compositionstart", e);
}

function onCompositionUpdate(e) {
	handleCompositionEvent("compositionupdate", e);
}

function onCompositionEnd(e) {
	handleCompositionEvent("compositionend", e);
}

function addOutputRow() {
	var table = document.getElementById("output");

	while (table.rows.length >= MAX_OUTPUT_ROWS) {
		table.deleteRow(-1);
	}
	// Insert after the header rows.
	var row = table.insertRow(NUM_HEADER_ROWS);
	if (_isKeydown && document.getElementById("hl_keydown").checked) {
	    row.classList.add("keydown_row_hilight");
	}
	return row;
}

function handleInputEvent(etype, e) {
	var show = document.getElementById("show_" + etype);
	if (show.checked) {
		addInputEvent(etype, e);
	}
	handleDefaultPropagation(etype, e);
}

function handleKeyEvent(etype, e) {
	var show = document.getElementById("show_" + etype);
	if (show.checked) {
		addKeyEvent(etype, e);
	}
	handleDefaultPropagation(etype, e);
}

function handleCompositionEvent(etype, e) {
	var show = document.getElementById("show_"+etype);
	if (show.checked) {
		addCompositionEvent(etype, e);
	}
	handleDefaultPropagation(etype, e);
}

function handleDefaultPropagation(etype, e) {
	var preventDefault = document.getElementById("pd_" + etype);
	if (preventDefault.checked && e.preventDefault) {
		e.preventDefault();
	}
	var stopPropagation = document.getElementById("sp_" + etype);
	if (stopPropagation.checked && e.stopPropagation) {
		e.stopPropagation();
	}
	// Always prevent default for Tab.
	if (e.keyCode == 9 || e.code == "Tab") {
		e.preventDefault();
	}
}

function addInputEvent(etype, e) {
	if (!e) {
		e = window.event;
	}
	var eventinfo = {};
	eventinfo["etype"] = calcHilightString(etype, e.type, true);
	eventinfo["isComposing"] = e.isComposing;
	eventinfo["inputType"] = e.inputType;
	eventinfo["data"] = calcString(e.data);
	addEvent(eventinfo);
}

function getModifierState(e) {
	Modifiers = [
		"Alt", "AltGraph", "Control", "Shift", "Meta",
		// Locking keys
		"CapsLock", "NumLock", "ScrollLock",
		// Linux
		"Hyper", "Super",
		// Virtual keyboards
		"Symbol", "SymbolLock",
		// Not valid, but check anyway
		"Fn", "FnLock",
		];
	mods = undefined;
	for (var mod of Modifiers) {
		if (e.getModifierState(mod)) {
			if (!mods) {
				mods = mod;
			} else {
				mods += ", " + mod;
			}
		}
	}
	return mods;
}

function addKeyEvent(etype, e) {
	if (!e) {
		e = window.event;
	}
	var eventinfo = {};
	eventinfo["etype"] = calcHilightString(etype, e.type, true);
	eventinfo["charCode"] = calcRichKeyVal(etype, "charCode", e.charCode);
	eventinfo["keyCode"] = calcRichKeyVal(etype, "keyCode", e.keyCode);
	eventinfo["which"] = e.which;
	eventinfo["getModifierState"] = getModifierState(e);
	eventinfo["shift"] = e.shiftKey;
	eventinfo["ctrl"] = e.ctrlKey;
	eventinfo["alt"] = e.altKey;
	eventinfo["meta"] = e.metaKey;
	eventinfo["keyIdentifier"] = e.keyIdentifier;
	eventinfo["keyLocation"] = calcLocation(e.keyLocation);
	eventinfo["char"] = calcString(e.char);
	eventinfo["key"] = calcHilightString(etype, e.key, false);
	eventinfo["code"] = e.code;
	eventinfo["location"] = calcLocation(e.location);
	eventinfo["repeat"] = e.repeat;
	eventinfo["isComposing"] = e.isComposing;
	addEvent(eventinfo);
}

function addCompositionEvent(etype, e) {
	if (!e) {
		e = window.event;
	}
	var eventinfo = {};
	eventinfo["etype"] = calcHilightString(etype, e.type, true);
	eventinfo["isComposing"] = e.isComposing;
	eventinfo["data"] = calcString(e.data);
	addEvent(eventinfo);
}

/* Create the event table row from the event info */
function addEvent(eventinfo) {
	var row = addOutputRow();
	addTableCellText(row, _seqId, "etype");
	addTableCell(row, eventinfo["etype"], "etype");
	addTableCell(row, eventinfo["charCode"], "legacy");
	addTableCell(row, eventinfo["keyCode"], "legacy");
	addTableCellText(row, eventinfo["which"], "legacy");
	addTableCellText(row, eventinfo["getModifierState"], "modifiers");
	addTableCellBoolean(row, eventinfo["shift"], "modifiers");
	addTableCellBoolean(row, eventinfo["ctrl"], "modifiers");
	addTableCellBoolean(row, eventinfo["alt"], "modifiers");
	addTableCellBoolean(row, eventinfo["meta"], "modifiers");
	addTableCellText(row, eventinfo["keyIdentifier"], "olddom3");
	addTableCellText(row, eventinfo["keyLocation"], "olddom3");
	addTableCellText(row, eventinfo["char"], "olddom3");
	addTableCell(row, eventinfo["key"], "uievents");
	addTableCellText(row, eventinfo["code"], "uievents");
	addTableCellText(row, eventinfo["location"], "uievents");
	addTableCellBoolean(row, eventinfo["repeat"], "uievents");
	addTableCellBoolean(row, eventinfo["isComposing"], "uievents");
	addTableCellText(row, eventinfo["inputType"], "uievents");
	addTableCellText(row, eventinfo["data"], "uievents");
	addTableCellText(row, eventinfo["locale"], "proposed");
	addInputCell(row);
}

function calcLocation(loc) {
	if (loc == 1) return "LEFT";
	if (loc == 2) return "RIGHT";
	if (loc == 3) return "NUMPAD";
	return loc;
}

function calcRichKeyVal(eventType, attrName, key) {
	if (key === undefined) {
		return null;
	}

	var keyString = String.fromCharCode(key);
	if (attrName == "keyCode") {
		// Don't even try to decipher keyCode unless it's alphanum.
		if (key < 32 || key > 90) {
			keyString = "";
		}
		// ...or a modifier.
		switch (key) {
			case 16: keyString = "Shift"; break;
			case 17: keyString = "Control"; break;
			case 18: keyString = "Alt"; break;
			case 91:
			case 93:
			case 224:
				keyString = "Meta";
				break;
		}
	}

	if (keyString != ""
			&& ((eventType == "keypress" && attrName == "charCode")
				|| ((eventType == "keydown" || eventType == "keyup") && attrName == "keyCode")
				)
			) {
		var data = document.createElement("span");
		data.appendChild(document.createTextNode(key));
		var keySpan = document.createElement("span");
		if (document.getElementById("hl_" + eventType).checked) {
			keySpan.classList.add("keyevent_hilight");
			keySpan.classList.add(eventType + "_hilight");
		} else {
			keyString = " " + keyString;
		}
		keySpan.textContent = keyString;
		data.appendChild(keySpan);
		return data;
	}
	return document.createTextNode(key);
}

function calcBoolean(key) {
	return key ? "✓" : "✗";
}

function calcString(data) {
	if (data === undefined) {
		return data;
	}
	return "'" + data + "'";
}

function calcHilightString(eventType, data, addArrow) {
	if (data === undefined) {
		return null;
	}

	var keySpan = document.createElement("span");
	var enableHilight = document.getElementById("hl_" + eventType);
	if (enableHilight && enableHilight.checked) {
		keySpan.classList.add("keyevent_hilight");
		keySpan.classList.add(eventType + "_hilight");
		if (addArrow && (eventType == "keydown" || eventType == "keyup")) {
			keySpan.classList.add(eventType + "_arrow");
		}
	}
	keySpan.textContent = data;
	return keySpan;
}

/* Set the focus to the input box. */
function setInputFocus(resetData=false) {
	var input = document.getElementById("input");
	if (resetData) {
		input.value = "";
	}
	input.focus();
}

function toggleReadonly() {
	var cbReadonly = document.getElementById("readonlyToggle");
	var input = document.getElementById("input");
	if (cbReadonly.checked) {
		input.setAttribute('readonly', true);
	} else {
		input.removeAttribute('readonly');
	}
	setInputFocus();
}

function resetTable() {
	clearTable();
	createTableHeader();
	_seqId = 1;

	setInputFocus(true);
}

function clearTable() {
	clearChildren(document.getElementById("output"));
}

function addInputCell(row) {
	var value = document.getElementById("input").value;
	addTableCellText(row, "'" + value + "'", "inputbox", undefined, undefined, "left");
	_seqId++;
}

function addTableCellBoolean(row, key, celltype) {
	var modstyle = key ? "modOn" : "modOff";
	addTableCellText(row, calcBoolean(key), celltype, modstyle);
}

function addTableCellText(row, textdata, celltype, style, span, align) {
	var data = null;
	if (textdata !== undefined) {
		data = document.createTextNode(textdata);
	}
	addTableCell(row, data, celltype, style, span, align);
}

function addTableCell(row, data, celltype, style, span, align) {
	var cell = row.insertCell(-1);
	if (data === undefined || data == null) {
		data = document.createTextNode("-");
		style = "undef";
	}
	cell.appendChild(data);
	if (align === undefined) {
		align = "center";
	}
	cell.setAttribute("align", align);
	if (span !== undefined) {
		cell.setAttribute("colspan", span);
	}
	cell.classList.add("keycell");
	cell.classList.add(celltype);
	if (style !== undefined) {
		if (style instanceof Array) {
			for (var i = 0; i < style.length; i++) {
				cell.classList.add(style[i]);
			}
		} else {
			cell.classList.add(style);
		}
	}
	if (celltype == "etype" || celltype == "empty") {
		return;
	}
	// Hide this cell if it belongs to a hidden celltype.
	var show = document.getElementById("show_" + celltype).checked;
	if (!show) {
		cell.style.display = "none";
	}
}

var _table_columns = [
	// Format:
	// array of <group-info>
	// <group-info> : [ <group-title>, <cell-type>, <styles>, <num-cols>, <columns> ]
	//   <group-title> : 
	//   <cell-type> : cell type for style
	//   <styles> : additional styles (may be string or array of strings)
	//   <columns> : an array of <col-info>
	// <col-info> : [ <title>, <cell-type>, <styles> ]

	// Unlabeled group
	["", "empty", undefined, [
		["#", "etype", "etype_header"],
		["Event type", "etype", ["etype_header", "subheader"]],
	]],
	
	// KeyboardEvent - Legacy
	["Legacy", "legacy", "legacy_header", [
		["charCode", "legacy", ["legacy_header", "subheader"]],
		["keyCode", "legacy", ["legacy_header", "subheader"]],
		["which", "legacy", ["legacy_header", "subheader"]],
	]],

	// KeyboardEvent - Modifiers
	["Modifiers", "modifiers", "modifiers_header", [
		["getModifierState()", "modifiers", ["modifiers_header", "subheader"]],
		["shift", "modifiers", ["modifiers_header", "subheader"]],
		["ctrl", "modifiers", ["modifiers_header", "subheader"]],
		["alt", "modifiers", ["modifiers_header", "subheader"]],
		["meta", "modifiers", ["modifiers_header", "subheader"]],
	]],

	// KeyboardEvent - Old DOM3
	["Old DOM3", "olddom3", "olddom3_header", [
		["keyIdentifier", "olddom3", ["olddom3_header", "subheader"]],
		["keyLocation", "olddom3", ["olddom3_header", "subheader"]],
		["char", "olddom3", ["olddom3_header", "subheader"]],
	]],

	// KeyboardEvent - UI Events
	["UI Events", "uievents", "uievents_header", [
		["key", "uievents", ["uievents_header", "subheader"]],
		["code", "uievents", ["uievents_header", "subheader"]],
		["location", "uievents", ["uievents_header", "subheader"]],
		["repeat", "uievents", ["uievents_header", "subheader"]],
		["isComposing", "uievents", ["uievents_header", "subheader"]],
		["inputType", "uievents", ["uievents_header", "subheader"]],
		["data", "uievents", ["uievents_header", "subheader"]],
	]],

	// KeyboardEvent - Proposed
	["Proposed", "proposed", "proposed_header", [
		["locale", "proposed", ["proposed_header", "subheader"]],
	]],

	// Input
	["", "inputbox", "empty", [
		["Input field", "inputbox", ["inputbox_header", "subheader"]],
	]],
];

function createTableHeader() {
	var table = document.getElementById("output");
	var head = table.createTHead();
	var row1 = head.insertRow(-1);  // For column group names
	var row2 = head.insertRow(-1);  // For column names

	for (var group of _table_columns) {
		var group_title = group[0]
		var group_type = group[1]
		var group_style = group[2]
		var columns = group[3]
		addTableCellText(row1, group_title, group_type, group_style, columns.length);

		for (var col of columns) {
			var title = col[0];
			var type = col[1]
			var style = col[2]
			addTableCellText(row2, title, type, style);
		}
	}
}

function toggleOptions() {
	var link = document.getElementById("optionsToggle");
	var options = document.getElementById("options");
	clearChildren(link);
	if (options.style.display == "block") {
		options.style.display = "none";
		link.appendChild(document.createTextNode("Show Options"));
	}
	else {
		options.style.display = "block";
		link.appendChild(document.createTextNode("Hide Options"));
	}
	setInputFocus();
}

function showFieldClick(cb) {
	var celltype = cb.id.split('_')[1];
	var show = cb.checked;

	var table = document.getElementById("output");
	for (var ir = 0, row; row = table.rows[ir]; ir++) {
		for (var ic = 0, cell; cell = row.cells[ic]; ic++) {
			if (cell.classList.contains(celltype)) {
				if (show) {
					cell.style.display = "";
				} else {
					cell.style.display = "none";
				}
			}
		}
	}
}
