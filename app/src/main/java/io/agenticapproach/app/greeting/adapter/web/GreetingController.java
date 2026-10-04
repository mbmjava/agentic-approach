package io.agenticapproach.app.greeting.adapter.web;

import io.agenticapproach.app.greeting.application.GreetingUseCase;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Driving (web) adapter: translates HTTP into a call on the application's inbound port. */
@RestController
public class GreetingController {

    private final GreetingUseCase greeting;

    public GreetingController(GreetingUseCase greeting) {
        this.greeting = greeting;
    }

    @GetMapping("/hello")
    public String hello() {
        return greeting.greet().message();
    }
}
