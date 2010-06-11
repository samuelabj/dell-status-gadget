var helper = {
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

helper.settings = {

	init: function() {
		for(var i = 0; i < arguments.length; i++) {
			this[arguments[i]] = null;
		}
	},

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

helper.debug = {
	enabled: false,
	
	trace: function() {
		if(!this.enabled) return;
		
		try {
			var append = 8;
			var unicode = -1;
			
			var fs = new ActiveXObject("Scripting.FileSystemObject");
			var newFile = fs.OpenTextFile("c:/debug.txt", append, true, unicode);

			try {
				newFile.Write(new Date().toString());
				newFile.Write(": ");
				
				for(var i = 0; i < arguments.length; i++) {
					if(i > 0) newFile.Write(", ");
					this.write(newFile, i, arguments[i]);
				}		
				newFile.WriteLine();
			}
			finally {
				newFile.Close();
			}
		}
		catch (e) {
			// Do nothing
		}
	},
	
	write: function(f, key, val) {
		f.Write(key);
		f.Write("(");
		
		if(typeof val == "object" && val.constructor != Date) {
			var c = 0;
			for(var i in val) {
				if(c++ > 0) f.Write(", ");
				this.write(f, i, val[i]);
			}
			return;
		}

		f.Write(val);
		f.Write(")");
	}
}