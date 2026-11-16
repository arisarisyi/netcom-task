import express from "express"
import { authMiddleware, authorizeRole } from "../middleware/auth-middleware"
import { RevenueController } from "../controller/revenue-controller"
import { ProductCategoryTranslationController } from "../controller/product-category-controller"
import { GeolocationController } from "../controller/geolocation-controller"
import { CustomerController } from "../controller/customer-controller"
import { SellerController } from "../controller/seller-controller"
import { ProductController } from "../controller/product-controller"
import { OrderController } from "../controller/order-controller"
import { OrderItemController } from "../controller/order-item-controller"
import { OrderPaymentController } from "../controller/order-payment-controller"
import { OrderReviewController } from "../controller/order-review-controller"

export const apiSecured = express.Router()
apiSecured.use(authMiddleware as express.RequestHandler)

const adminOnly = authorizeRole("admin")
const sellerAccess = authorizeRole("sellers")
const customerAccess = authorizeRole("customers")
const allRoles = authorizeRole("customers", "sellers")

apiSecured.get("/api/revenues/daily", sellerAccess, RevenueController.dailyRevenue)
apiSecured.get("/api/revenues/anomalies", sellerAccess, RevenueController.dailyRevenueAnomalies)
apiSecured.get("/api/revenues/anomalies/yearly", sellerAccess, RevenueController.monthlyRevenueAnomalies)

apiSecured.get("/api/product-categories", allRoles, ProductCategoryTranslationController.list)
apiSecured.post("/api/product-categories", adminOnly, ProductCategoryTranslationController.create)
apiSecured.get("/api/product-categories/:id", allRoles, ProductCategoryTranslationController.get)
apiSecured.put("/api/product-categories/:id", adminOnly, ProductCategoryTranslationController.update)
apiSecured.delete("/api/product-categories/:id", adminOnly, ProductCategoryTranslationController.remove)

apiSecured.get("/api/geolocations", allRoles, GeolocationController.list)
apiSecured.post("/api/geolocations", adminOnly, GeolocationController.create)
apiSecured.get("/api/geolocations/:id", allRoles, GeolocationController.get)
apiSecured.put("/api/geolocations/:id", adminOnly, GeolocationController.update)
apiSecured.delete("/api/geolocations/:id", adminOnly, GeolocationController.remove)

apiSecured.get("/api/customers", adminOnly, CustomerController.list)
apiSecured.post("/api/customers", adminOnly, CustomerController.create)
apiSecured.get("/api/customers/:id", adminOnly, CustomerController.get)
apiSecured.put("/api/customers/:id", adminOnly, CustomerController.update)
apiSecured.delete("/api/customers/:id", adminOnly, CustomerController.remove)

apiSecured.get("/api/sellers", adminOnly, SellerController.list)
apiSecured.post("/api/sellers", adminOnly, SellerController.create)
apiSecured.get("/api/sellers/:id", adminOnly, SellerController.get)
apiSecured.put("/api/sellers/:id", adminOnly, SellerController.update)
apiSecured.delete("/api/sellers/:id", adminOnly, SellerController.remove)

apiSecured.get("/api/products", allRoles, ProductController.list)
apiSecured.post("/api/products", sellerAccess, ProductController.create)
apiSecured.get("/api/products/:id", allRoles, ProductController.get)
apiSecured.put("/api/products/:id", sellerAccess, ProductController.update)
apiSecured.delete("/api/products/:id", sellerAccess, ProductController.remove)

apiSecured.get("/api/orders", customerAccess, OrderController.list)
apiSecured.post("/api/orders", customerAccess, OrderController.create)
apiSecured.get("/api/orders/:id", customerAccess, OrderController.get)
apiSecured.put("/api/orders/:id", customerAccess, OrderController.update)
apiSecured.delete("/api/orders/:id", customerAccess, OrderController.remove)
apiSecured.get("/api/order-items", customerAccess, OrderItemController.list)
apiSecured.post("/api/order-items", customerAccess, OrderItemController.create)
apiSecured.get("/api/order-items/:order_id/:order_item_id", customerAccess, OrderItemController.get)
apiSecured.put("/api/order-items/:order_id/:order_item_id", customerAccess, OrderItemController.update)
apiSecured.delete("/api/order-items/:order_id/:order_item_id", customerAccess, OrderItemController.remove)
apiSecured.get("/api/order-payments", customerAccess, OrderPaymentController.list)
apiSecured.post("/api/order-payments", customerAccess, OrderPaymentController.create)
apiSecured.get("/api/order-payments/:order_id/:payment_sequential", customerAccess, OrderPaymentController.get)
apiSecured.put("/api/order-payments/:order_id/:payment_sequential", customerAccess, OrderPaymentController.update)
apiSecured.delete("/api/order-payments/:order_id/:payment_sequential", customerAccess, OrderPaymentController.remove)
apiSecured.get("/api/order-reviews", customerAccess, OrderReviewController.list)
apiSecured.post("/api/order-reviews", customerAccess, OrderReviewController.create)
apiSecured.get("/api/order-reviews/:id", customerAccess, OrderReviewController.get)
apiSecured.put("/api/order-reviews/:id", customerAccess, OrderReviewController.update)
apiSecured.delete("/api/order-reviews/:id", customerAccess, OrderReviewController.remove)
