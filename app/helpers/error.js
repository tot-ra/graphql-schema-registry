exports.PublicError = class PublicError extends Error {
	constructor(message, props) {
		if (typeof message === 'object') {
			super(message.message);

			Object.assign(this, message);
		} else {
			super(message);
		}

		if (props) {
			Object.assign(this, props);
		}
	}
};

exports.PublicError.prototype.isDisplayedToUser = true;

exports.InternalError = class InternalError extends Error {
	constructor(message, props) {
		if (typeof message === 'object') {
			super(message.message);

			Object.assign(this, message);
		} else {
			super(message);
		}

		if (props) {
			Object.assign(this, props);
		}
	}
};

exports.InternalError.prototype.isDisplayedToUser = false;
