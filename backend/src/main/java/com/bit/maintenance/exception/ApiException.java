package com.bit.maintenance.exception;

import org.springframework.http.HttpStatus;

// A single exception type for expected, meaningful failures (bad input,
// duplicate email, forbidden action) so controllers can throw a clear
// message + status instead of leaking stack traces to the frontend.
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
