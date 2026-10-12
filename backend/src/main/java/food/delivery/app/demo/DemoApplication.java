
package food.delivery.app.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        System.out.println("Starting Food Delivery App...");
        SpringApplication.run(DemoApplication.class, args);
        System.out.println("Food Delivery App started successfully!");
    }

    @Bean
    CommandLineRunner checkFoodData(FoodRepository foodRepository) {
        return args -> {
            System.out.println("Food DataLoader Check Started!");
            System.out.println("Total Food Items: " + foodRepository.count());
        };
    }
}
