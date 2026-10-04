package io.agenticapproach.app;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class GreetingControllerTest {

    @Test
    void helloReturnsGreeting() {
        assertEquals("hello from agentic-approach", new GreetingController().hello());
    }
}
