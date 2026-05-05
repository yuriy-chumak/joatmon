export
class HttpError extends Error {
	constructor(status, message) {
		super(status instanceof Response ? status.statusText : message);

		this.status = status instanceof Response ? status.status : status;

		this.name = 'HttpError';
	}
}
