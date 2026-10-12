
package food.delivery.app.demo;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174"
})
public class OrderController {

    @PersistenceContext
    private EntityManager entityManager;

    public static class OrderRequest {
        public String customerName;
        public String customerEmail;
        public String phone;
        public String address;
        public List<CartItem> items;
    }

    public static class CartItem {
        public Long foodId;
        public int quantity;
    }

    @PostMapping
    @Transactional
    public CustomerOrder placeOrder(
            @RequestBody OrderRequest request) {

        if (request.customerName == null ||
            request.customerName.isBlank() ||
            request.customerEmail == null ||
            request.customerEmail.isBlank() ||
            request.phone == null ||
            request.phone.isBlank() ||
            request.address == null ||
            request.address.isBlank() ||
            request.items == null ||
            request.items.isEmpty()) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Enter customer details and food items"
            );
        }

        CustomerOrder order = new CustomerOrder();
        order.setCustomerName(request.customerName.trim());
        order.setCustomerEmail(
            request.customerEmail.trim().toLowerCase(Locale.ROOT)
        );
        order.setPhone(request.phone.trim());
        order.setAddress(request.address.trim());

        List<CustomerOrder.OrderLine> lines = new ArrayList<>();
        double total = 0;

        for (CartItem item : request.items) {
            if (item.foodId == null ||
                item.quantity < 1 ||
                item.quantity > 100) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid cart item"
                );
            }

            FoodItem food = entityManager.find(
                FoodItem.class, item.foodId
            );

            if (food == null) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Food item not found"
                );
            }

            CustomerOrder.OrderLine line =
                new CustomerOrder.OrderLine();

            line.setFoodId(food.getId());
            line.setFoodName(food.getName());
            line.setQuantity(item.quantity);
            line.setPrice(food.getPrice());

            lines.add(line);
            total += food.getPrice() * item.quantity;
        }

        order.setItems(lines);
        order.setTotalAmount(total);

        entityManager.persist(order);
        entityManager.flush();

        return order;
    }

    // Customer order history
    @GetMapping("/customer")
    public List<CustomerOrder> customerHistory(
            @RequestParam String email) {

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Email is required"
            );
        }

        return entityManager.createQuery(
            "SELECT o FROM CustomerOrder o " +
            "WHERE LOWER(o.customerEmail) = :email " +
            "ORDER BY o.orderTime DESC",
            CustomerOrder.class
        )
        .setParameter("email", email.trim().toLowerCase(Locale.ROOT))
        .getResultList();
    }

    // Admin: all orders
    @GetMapping
    public List<CustomerOrder> allOrders() {
        return entityManager.createQuery(
            "SELECT o FROM CustomerOrder o ORDER BY o.orderTime DESC",
            CustomerOrder.class
        ).getResultList();
    }

    // Track one order
    @GetMapping("/{id}")
    public CustomerOrder trackOrder(@PathVariable Long id) {
        CustomerOrder order = entityManager.find(
            CustomerOrder.class, id
        );

        if (order == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Order not found"
            );
        }

        return order;
    }

    // Admin: update order status
    @PutMapping("/{id}/status")
    @Transactional
    public CustomerOrder updateStatus(
            @PathVariable Long id,
            @RequestBody StatusRequest request) {

        CustomerOrder order = entityManager.find(
            CustomerOrder.class, id
        );

        if (order == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Order not found"
            );
        }

        if (request.status == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Status is required"
            );
        }

        String status = request.status.trim().toUpperCase(Locale.ROOT);

        List<String> allowed = List.of(
            "PLACED",
            "PREPARING",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED"
        );

        if (!allowed.contains(status)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Invalid order status"
            );
        }

        order.setStatus(status);
        return order;
    }

    public static class StatusRequest {
        public String status;
    }
}
