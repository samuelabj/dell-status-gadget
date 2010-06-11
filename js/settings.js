System.Gadget.onSettingsClosing = settings_closing;
var $username;

function settings_load() {
	$url = $("#url");

	helper.settings.load();
	$url.val(helper.settings.url);
}

function settings_closing(e) {
	if (e.closeAction != e.Action.commit) return;

	if(!$url.val()) {
		set_msg("must supply url");
		e.cancel = true;
		return;
	}
	
	helper.settings.url = $url.val();
	helper.settings.save();
}

function set_msg(msg) {
	$("#msg").html(msg);
}