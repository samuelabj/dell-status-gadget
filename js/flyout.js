function flyout_load() {
}

function clear() {
	$("table").empty();
}

function append(name, value) {
	$("table").append("<tr><th>" + name + "</th><td>" + value + "</td></tr>");
}

function title(text) {
	$("h1").html(text);
	$("#back-icon")[0].className = text;
}