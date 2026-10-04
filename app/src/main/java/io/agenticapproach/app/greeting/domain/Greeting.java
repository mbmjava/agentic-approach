package io.agenticapproach.app.greeting.domain;

/**
 * Domain value: a greeting message. No framework or infrastructure types belong in this package —
 * the domain is the part of the app that should be testable with plain Java.
 */
public record Greeting(String message) {

    public Greeting {
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("message must not be blank");
        }
    }
}
