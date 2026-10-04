package io.agenticapproach.app;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Replace this with your domain. One trivial endpoint keeps the starter buildable and testable. */
@RestController
public class GreetingController {

    @GetMapping("/hello")
    public String hello() {
        return "hello from agentic-approach";
    }
}
