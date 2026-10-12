
package food.delivery.app.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

@Configuration
public class DataLoader {

    @Bean
    @Order(1)
    CommandLineRunner loadFoods(FoodRepository foodRepository) {
        return args -> {

            long count = foodRepository.count();

            System.out.println("Existing food count: " + count);

            if (count == 0) {

                FoodItem food1 = new FoodItem();
                food1.setName("Chicken Biryani");
                food1.setDescription("Spicy chicken biryani");
                food1.setPrice(180.0);
                food1.setCategory("Biryani");
                foodRepository.save(food1);

                FoodItem food2 = new FoodItem();
                food2.setName("Veg Fried Rice");
                food2.setDescription("Fresh vegetable fried rice");
                food2.setPrice(120.0);
                food2.setCategory("Rice");
                foodRepository.save(food2);

                FoodItem food3 = new FoodItem();
                food3.setName("Masala Dosa");
                food3.setDescription(
                    "Crispy dosa with potato masala"
                );
                food3.setPrice(80.0);
                food3.setCategory("South Indian");
                foodRepository.save(food3);

                System.out.println("Sample food items added!");

            } else {
                System.out.println(
                    "Food items already exist. Skipping sample data."
                );
            }

            System.out.println(
                "Final food count: " + foodRepository.count()
            );
        };
    }
}