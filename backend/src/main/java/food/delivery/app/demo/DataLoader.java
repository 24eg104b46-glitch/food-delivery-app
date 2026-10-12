```java
package food.delivery.app.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        System.out.println("Starting Food Delivery App...");
        SpringApplication.run(DemoApplication.class, args);
        System.out.println("Food Delivery App started successfully!");
    }
}
```