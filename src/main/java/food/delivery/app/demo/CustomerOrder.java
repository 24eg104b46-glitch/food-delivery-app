
package food.delivery.app.demo;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customer_orders")
public class CustomerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerName;
    private String customerEmail;
    private String phone;
    private String address;
    private String status = "PLACED";
    private double totalAmount;
    private LocalDateTime orderTime;

    @ElementCollection
    @CollectionTable(
        name = "customer_order_items",
        joinColumns = @JoinColumn(name = "order_id")
    )
    private List<OrderLine> items = new ArrayList<>();

    public CustomerOrder() {}

    @PrePersist
    public void setOrderTime() {
        if (orderTime == null) {
            orderTime = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String name) {
        this.customerName = name;
    }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String email) {
        this.customerEmail = email;
    }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) {
        this.address = address;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double amount) {
        this.totalAmount = amount;
    }

    public LocalDateTime getOrderTime() { return orderTime; }

    public List<OrderLine> getItems() { return items; }
    public void setItems(List<OrderLine> items) {
        this.items = items;
    }

    @Embeddable
    public static class OrderLine {
        private Long foodId;
        private String foodName;
        private int quantity;
        private double price;

        public OrderLine() {}

        public Long getFoodId() { return foodId; }
        public void setFoodId(Long id) { this.foodId = id; }

        public String getFoodName() { return foodName; }
        public void setFoodName(String name) {
            this.foodName = name;
        }

        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }

        public double getPrice() { return price; }
        public void setPrice(double price) {
            this.price = price;
        }
    }
}
