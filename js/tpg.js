var tpg = {
	pluralise: function (number, text) {
		return text + (number == 1 ? "" : "s");
	},

	ajax: function (url, data, oncomplete, options) {
		if (!options) options = {};
		var defaults = {
			type: "POST",
			cache: false,
			async: true
		}
		$.extend(defaults, options);

		var func = function (r, data) {
			oncomplete(r, data);
		}

		$.ajax({
			url: url,
			type: defaults.type,
			data: data,
			cache: defaults.cache,
			success: function (data) { func(true, data); },
			error: function () { func(false); }
		});
	},
	
	isNumber: function(val) {
		return val !== "" && !isNaN(val);
	}
}

tpg.usage = {
	error: {
		unknown: 0,
		invalid: 1,
		parse: 2
	},

	scrape: function (username, password, onerror, onsuccess) {
		tpg.ajax("https://cyberstore.tpg.com.au/your_account/index.php?function=checkaccountusage",
		{
			check_username: username,
			password: password
		},
		function (r, data) {
			if (!r) {
				onerror(tpg.usage.error.unknown);
				return;
			}

			if (data.indexOf("Invalid username") != -1) {
				onerror(tpg.usage.error.invalid);
				return;
			}

			// Logout
			$.post("https://cyberstore.tpg.com.au/your_account/index.php?function=logout");

			var plan = /<b>Package Type:<\/b> (.+?)<\/td>/.exec(data);
			var peak = /Downloads used:.*?([\d.]+?) MB/.exec(data); // Don't look for peak, just use the first download
			var offpeak = /Off-Peak Downloads used:.*?([\d.]+?) MB/.exec(data);
			var expire = /<b>Expiry Date:<\/b>(.+?)<\/td>/.exec(data);
			
			if(!plan || !peak || !expire) {
				onerror(tpg.usage.error.parse);
				return;
			}
			
			var data = {
				plan: plan[1],
				peak: parseFloat(peak[1]),
				offpeak: offpeak ? parseFloat(offpeak[1]) : null,
				expire: new Date(expire[1])
			}

			data.expire.setHours(23); data.expire.setMinutes(59); data.expire.setSeconds(59);

			onsuccess(data);
		});
	}
}

tpg.settings = {
	username: null,
	password: null,
	peak_quota: null,
	offpeak_quota: null,
	interval: null,

	load: function () {
		for (var k in this) {
			if (typeof this[k] == "function") continue;
			this[k] = System.Gadget.Settings.readString(k);
		}
	},

	save: function () {
		for (var k in this) {
			if (typeof this[k] == "function") continue;
			System.Gadget.Settings.writeString(k, this[k]);
		}
	}
}