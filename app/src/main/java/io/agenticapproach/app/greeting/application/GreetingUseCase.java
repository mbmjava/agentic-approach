package io.agenticapproach.app.greeting.application;

import io.agenticapproach.app.greeting.domain.Greeting;

/** Inbound port: what the outside world may ask this feature to do. Adapters depend on this, not the impl. */
@FunctionalInterface
public interface GreetingUseCase {

    Greeting greet();
}
