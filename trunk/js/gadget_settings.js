function Settings() {
	var self = this;

	this.username = null;
	this.password = null;
	this.peak_quota = null;
	this.offpeak_quota = null;

	this.load = function () {
		for (var k in self) {
			if (typeof self[k] == "function") continue;
			self[k] = System.Gadget.Settings.readString(k);
		}
	}

	this.save = function () {
		for (var k in self) {
			if (typeof self[k] == "function") continue;
			System.Gadget.Settings.writeString(k, self[k]);
		}
	}
}