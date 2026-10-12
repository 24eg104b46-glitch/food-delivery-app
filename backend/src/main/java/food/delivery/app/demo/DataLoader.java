
package food.delivery.app.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner loadFoods(FoodRepository foodRepository) {
        return args -> {
            System.out.println("DataLoader is running!");
            System.out.println("Total Food Items: " + foodRepository.count());
        };
    }
}
