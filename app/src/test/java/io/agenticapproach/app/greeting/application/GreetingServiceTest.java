package io.agenticapproach.app.greeting.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import io.agenticapproach.app.greeting.domain.Greeting;
import org.junit.jupiter.api.Test;

/** Hermetic test: the service and domain run without Spring or any infrastructure. */
class GreetingServiceTest {

    private final GreetingService service = new GreetingService();

    @Test
    void greetReturnsTheHouseGreeting() {
        assertEquals("hello from agentic-approach", service.greet().message());
    }

    @Test
    void greetingRejectsBlankMessages() {
        assertThrows(IllegalArgumentException.class, () -> new Greeting("   "));
    }
}
