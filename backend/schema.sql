create table if not exists users (
    id CHAR(32) primary key,
    name text not null,
    email text not null unique,
    role text not null default 'customers' check (role in ('admin', 'customers', 'sellers')),
    password text not null,
    created_at timestamptz not null default now(),
    created_by CHAR(32) references users (id) on delete set null,
    updated_at timestamptz,
    updated_by CHAR(32) references users (id) on delete set null,
    deleted_at timestamptz,
    deleted_by CHAR(32) references users (id) on delete set null
);

CREATE TABLE product_category_translation (
    product_category_name          VARCHAR(80)  PRIMARY KEY,
    product_category_name_english  VARCHAR(80)  NOT NULL,
    created_by                     CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    created_at                     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by                     CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    updated_at                     TIMESTAMPTZ,
    deleted_by                     CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    deleted_at                     TIMESTAMPTZ
);

CREATE TABLE geolocation (
    geolocation_id             BIGSERIAL     PRIMARY KEY,
    geolocation_zip_code_prefix VARCHAR(10)  NOT NULL,
    geolocation_lat            DOUBLE PRECISION NOT NULL,
    geolocation_lng            DOUBLE PRECISION NOT NULL,
    geolocation_city           VARCHAR(120)  NOT NULL,
    geolocation_state          CHAR(2)       NOT NULL,
    created_by                 CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    created_at                 TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_by                 CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    updated_at                 TIMESTAMPTZ,
    deleted_by                 CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    deleted_at                 TIMESTAMPTZ
);
CREATE INDEX idx_geolocation_zip  ON geolocation (geolocation_zip_code_prefix);
CREATE INDEX idx_geolocation_city ON geolocation (geolocation_city);

CREATE TABLE customers (
    customer_id              CHAR(32)     PRIMARY KEY,
    customer_unique_id       CHAR(32)     NOT NULL,
    customer_zip_code_prefix VARCHAR(10)  NOT NULL,
    customer_city            VARCHAR(120) NOT NULL,
    customer_state           CHAR(2)      NOT NULL,
    created_by               CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    created_at               TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by               CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    updated_at               TIMESTAMPTZ,
    deleted_by               CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    deleted_at               TIMESTAMPTZ
);
CREATE INDEX idx_customers_unique_id ON customers (customer_unique_id);
CREATE INDEX idx_customers_zip       ON customers (customer_zip_code_prefix);

CREATE TABLE sellers (
    seller_id              CHAR(32)     PRIMARY KEY,
    seller_zip_code_prefix VARCHAR(10)  NOT NULL,
    seller_city            VARCHAR(120) NOT NULL,
    seller_state           CHAR(2)      NOT NULL,
    created_by             CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    created_at             TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by             CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    updated_at             TIMESTAMPTZ,
    deleted_by             CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    deleted_at             TIMESTAMPTZ
);
CREATE INDEX idx_sellers_zip ON sellers (seller_zip_code_prefix);

CREATE TABLE products (
    product_id                 CHAR(32)      PRIMARY KEY,
    product_category_name      VARCHAR(80),
    product_name_lenght        SMALLINT,
    product_description_lenght SMALLINT,
    product_photos_qty         SMALLINT,
    product_weight_g           INTEGER,
    product_length_cm          SMALLINT,
    product_height_cm          SMALLINT,
    product_width_cm           SMALLINT,
    CONSTRAINT fk_products_category
        FOREIGN KEY (product_category_name)
        REFERENCES product_category_translation (product_category_name),
    created_by                 CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    created_at                 TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by                 CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    updated_at                 TIMESTAMPTZ,
    deleted_by                 CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    deleted_at                 TIMESTAMPTZ
);
CREATE INDEX idx_products_category ON products (product_category_name);

CREATE TABLE orders (
    order_id                      CHAR(32)      PRIMARY KEY,
    customer_id                   CHAR(32)      NOT NULL,
    order_status                  VARCHAR(20)   NOT NULL,  -- delivered, shipped, canceled, ...
    order_purchase_timestamp      TIMESTAMP     NOT NULL,
    order_approved_at             TIMESTAMP,
    order_delivered_carrier_date  TIMESTAMP,
    order_delivered_customer_date TIMESTAMP,
    order_estimated_delivery_date TIMESTAMP     NOT NULL,
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES customers (customer_id),
    created_by                    CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    created_at                    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by                    CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    updated_at                    TIMESTAMPTZ,
    deleted_by                    CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    deleted_at                    TIMESTAMPTZ
);
CREATE INDEX idx_orders_customer    ON orders (customer_id);
CREATE INDEX idx_orders_status      ON orders (order_status);
CREATE INDEX idx_orders_purchase_ts ON orders (order_purchase_timestamp);

CREATE TABLE order_items (
    order_id             CHAR(32)      NOT NULL,
    order_item_id        SMALLINT      NOT NULL,
    product_id           CHAR(32)      NOT NULL,
    seller_id            CHAR(32)      NOT NULL,
    shipping_limit_date  TIMESTAMP     NOT NULL,
    price                NUMERIC(10,2) NOT NULL,
    freight_value        NUMERIC(10,2) NOT NULL DEFAULT 0,
    PRIMARY KEY (order_id, order_item_id),
    CONSTRAINT fk_items_order   FOREIGN KEY (order_id)   REFERENCES orders (order_id),
    CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products (product_id),
    CONSTRAINT fk_items_seller  FOREIGN KEY (seller_id)  REFERENCES sellers (seller_id),
    created_by          CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by          CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    updated_at          TIMESTAMPTZ,
    deleted_by          CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    deleted_at          TIMESTAMPTZ
);
CREATE INDEX idx_items_product ON order_items (product_id);
CREATE INDEX idx_items_seller  ON order_items (seller_id);

CREATE TABLE order_payments (
    order_id             CHAR(32)      NOT NULL,
    payment_sequential   SMALLINT      NOT NULL,
    payment_type         VARCHAR(20)   NOT NULL,  -- credit_card, boleto, voucher, debit_card, not_defined
    payment_installments SMALLINT      NOT NULL DEFAULT 1,
    payment_value        NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (order_id, payment_sequential),
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (order_id),
    created_by           CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by           CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    updated_at           TIMESTAMPTZ,
    deleted_by           CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    deleted_at           TIMESTAMPTZ
);
CREATE INDEX idx_payments_type ON order_payments (payment_type);

CREATE TABLE order_reviews (
    review_id                CHAR(32)    PRIMARY KEY,
    order_id                 CHAR(32)    NOT NULL,
    review_score             SMALLINT    NOT NULL CHECK (review_score BETWEEN 1 AND 5),
    review_comment_title     VARCHAR(120),
    review_comment_message   TEXT,
    review_creation_date     TIMESTAMP   NOT NULL,
    review_answer_timestamp  TIMESTAMP   NOT NULL,
    CONSTRAINT fk_reviews_order FOREIGN KEY (order_id) REFERENCES orders (order_id),
    created_by               CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    created_at               TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by               CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    updated_at               TIMESTAMPTZ,
    deleted_by               CHAR(32) REFERENCES users (id) ON DELETE SET NULL,
    deleted_at               TIMESTAMPTZ
);
CREATE INDEX idx_reviews_order  ON order_reviews (order_id);
CREATE INDEX idx_reviews_score  ON order_reviews (review_score);