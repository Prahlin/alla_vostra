class Cart:
    def __init__(self):
        self.items = {}  # {product_name: quantity}

    def add_item(self, product_name, quantity):
        if product_name in self.items:
            self.items[product_name] += quantity
        else:
            self.items[product_name] = quantity

    def remove_item(self, product_name):
        if product_name in self.items:
            del self.items[product_name]

    def view_cart(self):
        if not self.items:
            print("Your cart is empty.")
        else:
            print("Your cart contains:")
            for product_name, quantity in self.items.items():
                print(f"{product_name}: {quantity}")

    def get_total_price(self, prices):
        total = 0
        for product_name, quantity in self.items.items():
            if product_name in prices:
                total += prices[product_name] * quantity
        return total

# Example usage:
cart = Cart()

prices = {
    "apple": 0.80,
    "banana": 0.50,
    "milk": 2.50,
}

cart.add_item("apple", 2)
cart.add_item("milk", 1)
cart.view_cart()
print("Total price:", cart.get_total_price(prices))

cart.remove_item("apple")
cart.view_cart()
print("Total price:", cart.get_total_price(prices))