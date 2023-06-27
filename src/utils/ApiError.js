class ApiError extends Error {
    constructor(statusCode, field, message, error) {
        super(message);
        this.statusCode = statusCode;
        this.error = error;
        this.field = field;
    }

    /**
     * Use when a required field is missing
     * @param field {string}
     * @param message {string|null}
     * @returns {ApiError}
     */
    static MissingField(field, message = null) {
        message ||= `Missing required field: ${field}`;
        return new ApiError(400, field, message, "MISSING_FIELD");
    }

    /**
     * Use when a field is invalid but with no specific reason
     * @param field {string}
     * @param message {string|null}
     * @returns {ApiError}
     */
    static InvalidField(field, message = null) {
        message ||= `Invalid field: ${field}`;
        return new ApiError(400, field, message, "INVALID_FIELD");
    }

    /**
     * Use when a field's value is invalid
     * @param field {string}
     * @param message {string|null}
     * @returns {ApiError}
     */
    static InvalidValue(field, message = null) {
        message ||= `Invalid value for field: ${field}`;
        return new ApiError(400, field, message, "INVALID_VALUE");
    }

    /**
     * Use when a field that should be unique is already used
     * @param field {string}
     * @param message {string|null}
     * @returns {ApiError}
     */
    static UniqueField(field, message = null) {
        message ||= `${field.toUpperCase()} already used`;
        return new ApiError(409, field, message, "UNIQUE_FIELD");
    }

    /**
     * Use when a field is too short or too long
     * @param field {string}
     * @param min {number}
     * @param max {number}
     * @param message {string|null}
     * @returns {ApiError}
     */
    static InvalidLength(field, min = -1, max = -1, message = null) {
        if (!message) {
            if (min === max) {
                message = `${field} must be ${min} characters long`;
            } else if (min === -1) {
                message = `${field} must be less than ${max} characters long`;
            } else if (max === -1) {
                message = `${field} must be more than ${min} characters long`;
            } else {
                message = `${field} must be between ${min} and ${max} characters long`;
            }
        }
        return new ApiError(400, field, message, "INVALID_LENGTH");
    }

    /**
     * Use when an array is too short or too long
     * @param field {string}
     * @param min {number}
     * @param max {number}
     * @param message {string|null}
     * @returns {ApiError}
     */
    static InvalidLengthArray(field, min = -1, max = -1, message = null) {
        if (!message) {
            if (min === max) {
                message = `${field} must have ${min} items`;
            } else if (min === -1) {
                message = `${field} must have less than ${max} items`;
            } else if (max === -1) {
                message = `${field} must have more than ${min} items`;
            } else {
                message = `${field} must have between ${min} and ${max} items`;
            }
        }
        return new ApiError(400, field, message, "INVALID_LENGTH");
    }

    /**
     * Use when password is not strong enough
     * @param message {string|null}
     * @returns {ApiError}
     */
    static WeakPassword(message = null) {
        message ||= `password is not strong enough`;
        return new ApiError(400, "password", message, "WEAK_PASSWORD");
    }

    /**
     * Use when a field is not the correct type
     * @param field {string}
     * @param fieldType {string}
     * @param message {string|null}
     * @returns {ApiError}
     */
    static InvalidType(field, fieldType, message = null) {
        message ||= `${field} must be of type ${fieldType}`;
        return new ApiError(400, field, message, "INVALID_TYPE");
    }

    /**
     * Email or password is incorrect
     * @param message {string|null}
     * @returns {ApiError}
     */
    static InvalidCredentials(message = null) {
        message ||= `Your email or password is incorrect`;
        return new ApiError(401, "password", message, "INVALID_CREDENTIALS");
    }

    /**
     * Use when a user is not currently authenticated
     * @param message {string|null}
     * @returns {ApiError}
     */
    static NotAuthenticated(message = null) {
        message ||= `not authenticated`;
        return new ApiError(401, null, message, "NOT_AUTHENTICATED");
    }

    /**
     * Use when a user is authenticated but not authorized to perform an action
     * @param message {string|null}
     * @returns {ApiError}
     */
    static NotAuthorized(message = null) {
        message ||= `not authorized`;
        return new ApiError(403, null, message, "NOT_AUTHORIZED");
    }

    /**
     * Use when a field is not found
     * @param field {string}
     * @param message {string|null}
     * @returns {ApiError}
     */
    static NotFound(field, message = null) {
        message ||= `${field} not found`;
        return new ApiError(404, null, message, "NOT_FOUND");
    }
}

export default ApiError;