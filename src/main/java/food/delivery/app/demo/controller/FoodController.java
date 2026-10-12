
package food.delivery.app.demo;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/foods")
@CrossOrigin(origins = "http://localhost:5173")
public class FoodController {

    private final FoodRepository foodRepository;

    public FoodController(FoodRepository foodRepository) {
        this.foodRepository = foodRepository;
    }

    // Get all food items
    @GetMapping
    public List<FoodItem> getAllFoods() {
        return foodRepository.findAll();
    }

    // Get one food item
    @GetMapping("/{id}")
    public FoodItem getFoodById(@PathVariable Long id) {
        return foodRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Food not found"));
    }

    // Add food item
    @PostMapping
    public FoodItem addFood(@RequestBody FoodItem food) {
        food.setId(null);
        return foodRepository.save(food);
    }

    // Update food item
    @PutMapping("/{id}")
    public FoodItem updateFood(
            @PathVariable Long id,
            @RequestBody FoodItem food) {

        FoodItem existing = foodRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Food not found"));

        existing.setName(food.getName());
        existing.setDescription(food.getDescription());
        existing.setPrice(food.getPrice());
        existing.setCategory(food.getCategory());

        return foodRepository.save(existing);
    }

    // Delete food item
    @DeleteMapping("/{id}")
    public String deleteFood(@PathVariable Long id) {
        if (!foodRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Food not found");
        }

        foodRepository.deleteById(id);
        return "Food deleted successfully";
    }
}
