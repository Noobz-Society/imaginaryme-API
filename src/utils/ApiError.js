class ApiError extends Error {
    constructor(statusCode, field, message, error) {
        super(message);
        this.statusCode = statusCode;
        this.error = error;
        this.field = field;
    }

    /**
     * Use when a required field is missing
     * @param field
     * @returns {ApiError}
     */
    static MissingField(field) {
        const message = `Missing required field: ${field}`;
        return new ApiError(400, field, message, "MISSING_FIELD");
    }

    /**
     * Use when a field is invalid but with no specific reason
     * @param field
     * @see InvalidLength
     * @returns {ApiError}
     */
    static InvalidField(field) {
        const message = `Invalid field: ${field}`;
        return new ApiError(400, field, message, "INVALID_FIELD");
    }

    /**
     * Use when a field that should be unique is already used
     * @param field {string}
     * @returns {ApiError}
     */
    static UniqueField(field) {
        const message = `${field.toUpperCase()} already used`;
        return new ApiError(409, field, message, "UNIQUE_FIELD");
    }

    /**
     * Use when a field is too short or too long
     * @param field {string}
     * @param min {number}
     * @param max {number}
     * @returns {ApiError}
     */
    static InvalidLength(field, min = -1, max = -1) {
        let message;
        if (min === max) {
            message = `${field} must be ${min} characters long`;
        } else if (min === -1) {
            message = `${field} must be less than ${max} characters long`;
        } else if (max === -1) {
            message = `${field} must be more than ${min} characters long`;
        } else {
            message = `${field} must be between ${min} and ${max} characters long`;
        }
        return new ApiError(400, field, message, "INVALID_LENGTH");
    }

    /**
     * Use when password is not strong enough
     * @returns {ApiError}
     */
    static WeakPassword() {
        const message = `password is not strong enough`;
        return new ApiError(400, "password", message, "WEAK_PASSWORD");
    }

    /**
     * Email or password is incorrect
     * @returns {ApiError}
     */
    static InvalidCredentials() {
        const message = `Your email or password is incorrect`;
        return new ApiError(401, "password", message, "INVALID_CREDENTIALS");
    }

    /**
     * Use when a user is not currently authenticated
     * @returns {ApiError}
     */
    static NotAuthenticated() {
        const message = `not authenticated`;
        return new ApiError(401, null, message, "NOT_AUTHENTICATED");
    }

    /**
     * Use when a user is authenticated but not authorized to perform an action
     * @returns {ApiError}
     */
    static NotAuthorized() {
        const message = `not authorized`;
        return new ApiError(403, null, message, "NOT_AUTHORIZED");
    }
}

module.exports = ApiError;