package io.agenticapproach.app.greeting.application;

import io.agenticapproach.app.greeting.domain.Greeting;
import org.springframework.stereotype.Service;

/** Application service: implements the inbound port and depends only on the domain. */
@Service
public class GreetingService implements GreetingUseCase {

    @Override
    public Greeting greet() {
        return new Greeting("hello from agentic-approach");
    }
}
