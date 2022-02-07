export class PublicError extends Error {
	isDisplayedToUser: boolean;

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

		this.isDisplayedToUser = true;
	}
};

export class InternalError extends Error {
	isDisplayedToUser: boolean;

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

		this.isDisplayedToUser = true;
	}
};
