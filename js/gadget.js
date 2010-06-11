helper.settings.init("url", "start");

var fly = System.Gadget.Flyout;
fly.file = "flyout.html";
System.Gadget.settingsUI = "settings.html";
System.Gadget.onSettingsClosed = settings_closed;

var $container, $expire, $refresh;
var timer;

helper.debug.enabled = false;

function gadget_load() {
debugger;
	$container = $(".container");
	$expire = $(".bar-expire");
	$refresh = $(".refresh");

	$refresh.click(function() {
		get_status();
	});
	
	get_status();
}

function settings_closed(e) {
	if (e.closeAction == e.Action.commit) {
		get_status();
	}
}

function get_status() {
	helper.settings.load();
	helper.settings.url = "https://cs.ap.dell.com/support/orderstatus/details.aspx?l=en&c=au&oi=9NsasC6rJG0UETvG51ByBw%3d%3d&ds=u91QfyvZLR0%3d&vv=W7ujPnYngAob70E3SZdJNw%3d%3d&vt=QlUu5W6/lf%2bPFzAKatnsIw%3d%3d&country=au&~tab=0";
	helper.settings.start = new Date("28 May 2010").getTime();
	
	if(!helper.settings.url) {
		return;
	}
	
	$("h1 a").attr("href", helper.settings.url);

	window.clearTimeout(timer);
	set_msg("updating...", true);
	fly.show = false;

	dell.status.scrape(helper.settings.url,
		function (error) {
			switch (error) {
				case dell.status.error.invalid:
					set_msg("invalid request");
					break;
				case dell.status.unknown:
					set_msg("problem getting status");
					timer = window.setTimeout(get_status, 1000 * 60 * 5);
					break;
				case dell.status.parse:
					set_msg("parse error, need to update gadget");
					break;
			}

		}, function (data) {
			set_msg();

			helper.debug.trace(data);
			
			$container.find("#status").html(data.status.substring(0, 10) + "...").attr("title", data.status);
			$container.find("#eta").html(data.eta.toString().substring(0, data.eta.toString().indexOf(":00") - 2) + " " + data.eta.getYear());
			$container.find("#status-img").attr("src", data.status_img).css("visibility", "visible");		
			
			// Expire
			var period = new Period(data.eta);
			helper.debug.trace(period);
			$expire.find(".bar-extend").css("width", period.percent + "%");
			$expire.find("span").html(period.percent + "%");	
			
			var expireRemainingString = Math.floor(period.remaining.days) + " " +
			helper.pluralise(Math.floor(period.remaining.days), "day") + " " +
			Math.floor(period.remaining.hours) + " " +
			helper.pluralise(Math.floor(period.remaining.hours), "hour");
			
			$expire.attr("title", period.percent + "%");
			$expire.find("span").html(expireRemainingString);
			
			var updated = new Date().toString();
			updated = updated.substring(0, updated.indexOf("UTC"));
			
			/*doFlyout($expire, "Expiration", function (win) {
				win.append("Remaining", expireRemainingString);
				win.append("Updated", updated);
			});*/
			
			$refresh.attr("title", "Last updated " + updated);
			timer = window.setTimeout(get_status, 1000 * 60 * 60 * 1);
		});
}

function doFlyout($bar, title, func) {
	$bar[0].onclick = function () {
		var onShow = function () {
			var win = fly.document.parentWindow;
			win.title(title);
			win.clear();
			func(win);
		}

		if (!fly.show) {
			fly.onShow = onShow;
			fly.show = true;
		} else {
			onShow();
		}
	}
}

function set_msg(msg, processing) {
	if (!processing) processing = false;
	$(".msg").toggle(msg != null).toggleClass("processing", processing).html(msg);
}

function go(to, params) {
	var $form = $("<form method='post' action='" + to + "'></form>");
	for (k in params) {
		var $i = $("<input name='" + k + "' />");
		$i.val(params[k]);
		$form.append($i);
	}
	$(document.body).append($form);
	$form.submit();
	$form.remove();
}

function Period(expire) {
	this.expire = expire;
	this.start = new Date(new Number(helper.settings.start));
	this.total = new Duration(this.expire - this.start);
	this.remaining = new Duration(this.expire - new Date());
	this.passed = new Duration(new Date() - this.start);
	this.percent = Math.floor((this.total.days - this.remaining.days) / this.total.days * 100);
}

function Duration(milliseconds) {
	var day = 1000 * 60 * 60 * 24;
	var days = milliseconds / day;
	this.days = days;
	this.hours = (days - Math.floor(this.days)) * 24;
	this.seconds = milliseconds / 1000;
	this.milliseconds = milliseconds;
}

var dell = {};

dell.status = {
	error: {
		unknown: 0,
		invalid: 1,
		parse: 2
	},

	scrape: function (url, onerror, onsuccess) {
		var self = this;		
		helper.ajax(url,
		{},
		function (r, data) {
			if (!r) {
				onerror(self.error.unknown);
				return;
			}

			var status = /Current Status:[\s\S]*?<span class="para">(.+?)<\/span>/.exec(data);
			var eta = /Estimate Delivery Date:[\s\S]*?<span class="para">(.+?)<\/span>/.exec(data);
			var status_img = /<img src=(\/i\/Images\/APJ\/OrderStatus\/AU\/en\/\w*?_02.gif)/.exec(data);

			if(!status || !eta) {
				onerror(self.error.parse);
				return;
			}
			
			var data = {
				status: status[1],
				eta: new Date(eta[1].replace("-", " ", "g")),
				status_img: status_img ? url.substring(0, url.indexOf("/", url.indexOf("://") + 3)) + status_img[1] : null
			}
			
			// To the end of the business day
			data.eta.setHours(17);

			onsuccess(data);
		}, { type: "GET" });
	}
}