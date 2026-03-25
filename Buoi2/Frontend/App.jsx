const fallbackProducts = [
    { id: 1, name: "iPhone 15 128GB", price: 21490000, image: "https://picsum.photos/seed/fallback-1/420/300", sale: true, brand: "Apple", category: "phone" },
    { id: 2, name: "Samsung Galaxy S24", price: 19990000, image: "https://picsum.photos/seed/fallback-2/420/300", sale: false, brand: "Samsung", category: "phone" },
    { id: 3, name: "Xiaomi 14", price: 14990000, image: "https://picsum.photos/seed/fallback-3/420/300", sale: true, brand: "Xiaomi", category: "phone" },
    { id: 4, name: "MacBook Air M3", price: 30990000, image: "https://picsum.photos/seed/fallback-4/420/300", sale: false, brand: "Apple", category: "laptop" },
    { id: 5, name: "Dell XPS 13", price: 28990000, image: "https://picsum.photos/seed/fallback-5/420/300", sale: false, brand: "Dell", category: "laptop" },
    { id: 6, name: "ASUS Vivobook 14", price: 17990000, image: "https://picsum.photos/seed/fallback-6/420/300", sale: true, brand: "ASUS", category: "laptop" },
    { id: 7, name: "iPad Air", price: 15990000, image: "https://picsum.photos/seed/fallback-7/420/300", sale: false, brand: "Apple", category: "tablet" },
    { id: 8, name: "AirPods Pro", price: 5490000, image: "https://picsum.photos/seed/fallback-8/420/300", sale: true, brand: "Apple", category: "audio" },
    { id: 9, name: "Sony WH-1000XM5", price: 8990000, image: "https://picsum.photos/seed/fallback-9/420/300", sale: false, brand: "Sony", category: "audio" },
    { id: 10, name: "Apple Watch Series 9", price: 9990000, image: "https://picsum.photos/seed/fallback-10/420/300", sale: true, brand: "Apple", category: "wearable" }
];

const appConfig = window.APP_CONFIG || {};
const apiBaseUrl = typeof appConfig.API_BASE_URL === "string" && appConfig.API_BASE_URL.trim()
    ? appConfig.API_BASE_URL.trim().replace(/\/+$/, "")
    : "http://localhost:5000";
const productsApiUrl = `${apiBaseUrl}/api/products?limit=60`;

function formatVnd(number) {
    const safeNumber = Number(number) || 0;
    return safeNumber.toLocaleString("vi-VN") + " d";
}

function normalizeProductFromApi(item, index) {
    const id = Number(item.productkey || item.id) || index + 1;
    const unitPriceUsd = Number(item.unit_price_usd || item.price_usd || 0);
    const exchangeRate = 26000;
    const localPrice = item.price_vnd ? Number(item.price_vnd) : Math.round(unitPriceUsd * exchangeRate);
    const rawName = item.product_display_name || item.product_name || item.name || "";
    const normalizedName = String(rawName).trim();
    const safeName = normalizedName || `San pham ${id}`;

    return {
        id,
        name: safeName,
        price: localPrice,
        image: item.image || `https://picsum.photos/seed/postgres-${id}/420/300`,
        sale: typeof item.sale === "boolean" ? item.sale : id % 3 === 0,
        brand: item.brand || "Unknown",
        category: item.category || "other"
    };
}

function ProductCard({ product, isFavorite, cartQty, onQuickView, onToggleFavorite, onAddToCart }) {
    return (
        <article className={"card " + (isFavorite ? "favorite" : "") }>
            <div className="img-wrap">
                <img src={product.image} alt={product.name} />
                <div className="img-overlay"></div>
                <div className="card-head">
                    {product.sale ? <span className="badge">Giam gia</span> : <span className="badge ghost">Gia goc</span>}
                    <span className={"favorite-pill " + (isFavorite ? "on" : "")}>{isFavorite ? "Da thich" : "Chua thich"}</span>
                </div>
            </div>

            <div className="content">
                <h3 className="name">{product.name}</h3>
                <p className="price">{formatVnd(product.price)}</p>
                <p className="meta">Thuong hieu: {product.brand} | Danh muc: {product.category}</p>
                <p className="meta">Trong gio: {cartQty || 0}</p>

                <div className="action-row">
                    <button className="primary" onClick={() => onQuickView(product)}>
                        Xem nhanh
                    </button>
                    <button className="primary" onClick={() => onAddToCart(product.id)}>
                        Them gio
                    </button>
                    <button onClick={() => onToggleFavorite(product.id)}>
                        {isFavorite ? "Bo thich" : "Yeu thich"}
                    </button>
                </div>
            </div>
        </article>
    );
}

function ProductList({ products, favorites, cart, onQuickView, onToggleFavorite, onAddToCart }) {
    return (
        <section className="grid">
            {products.map((item) => (
                <ProductCard
                    key={item.id}
                    product={item}
                    isFavorite={favorites.includes(item.id)}
                    cartQty={cart[item.id] || 0}
                    onQuickView={onQuickView}
                    onToggleFavorite={onToggleFavorite}
                    onAddToCart={onAddToCart}
                />
            ))}
        </section>
    );
}

function ProductPage({
    productsToRender,
    products,
    dataSource,
    apiBaseUrl,
    keyword,
    sortBy,
    showSaleOnly,
    favorites,
    cart,
    isLoading,
    loadError,
    quickViewCount,
    lastViewed,
    onKeywordChange,
    onSortChange,
    onToggleSaleOnly,
    onResetFilter,
    onQuickView,
    onToggleFavorite,
    onAddToCart
}) {
    const cartCount = Object.values(cart).reduce((total, qty) => total + Number(qty), 0);

    return (
        <section className="layout">
            <aside className="panel">
                <h2>Bang dieu khien</h2>
                <p className="muted">Du lieu dang lay tu PostgreSQL API, ban co the loc va them gio ngay tai trang nay.</p>

                <div className="controls">
                    <div className="field">
                        <label htmlFor="search">Tim theo ten</label>
                        <input
                            id="search"
                            value={keyword}
                            onChange={(e) => onKeywordChange(e.target.value)}
                            placeholder="Vi du: Contoso, MP3..."
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="sort">Sap xep gia</label>
                        <select id="sort" value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
                            <option value="default">Mac dinh (theo id)</option>
                            <option value="price-asc">Gia tang dan</option>
                            <option value="price-desc">Gia giam dan</option>
                        </select>
                    </div>

                    <div className="control-row">
                        <button className={showSaleOnly ? "primary" : ""} onClick={onToggleSaleOnly}>
                            {showSaleOnly ? "Dang loc: Giam gia" : "Loc san pham giam gia"}
                        </button>
                        <button onClick={onResetFilter}>Reset bo loc</button>
                    </div>
                </div>

                <div className="status">
                    <div><strong>Trang thai tai du lieu:</strong> {isLoading ? "Dang tai..." : "San sang"}</div>
                    <div><strong>Nguon du lieu:</strong> {dataSource === "postgres" ? "PostgreSQL API" : "Fallback local"}</div>
                    <div><strong>API:</strong> {apiBaseUrl}</div>
                    <div><strong>Tong item:</strong> {products.length}</div>
                    <div><strong>Dang hien thi:</strong> {productsToRender.length}</div>
                    <div><strong>Da xem nhanh:</strong> {quickViewCount} lan</div>
                    <div><strong>Yeu thich:</strong> {favorites.length} item</div>
                    <div><strong>Tong so luong gio:</strong> {cartCount}</div>
                    <div>
                        <strong>San pham vua bam:</strong>{" "}
                        {lastViewed ? `${lastViewed.name} (${formatVnd(lastViewed.price)})` : "Chua co"}
                    </div>
                    {loadError ? <div style={{ color: "#9b2c2c", fontWeight: 700 }}>{loadError}</div> : null}
                </div>
            </aside>

            <section className="panel">
                <h2>Danh sach san pham</h2>
                <p className="muted">Bam Them gio de cap nhat gio hang, sau do qua trang Gio hang de quan ly chi tiet.</p>

                {isLoading ? <p className="muted">Dang tai san pham tu PostgreSQL...</p> : null}

                <ProductList
                    products={productsToRender}
                    favorites={favorites}
                    cart={cart}
                    onQuickView={onQuickView}
                    onToggleFavorite={onToggleFavorite}
                    onAddToCart={onAddToCart}
                />
            </section>
        </section>
    );
}

function CartPage({ cartItems, cartCount, cartTotal, onAddToCart, onDecreaseCart, onRemoveFromCart, onClearCart }) {
    return (
        <section className="cart-layout">
            <section className="panel cart-items-panel">
                <div className="cart-header">
                    <h2>Trang gio hang</h2>
                    <span className="badge ghost">{cartCount} san pham</span>
                </div>
                <p className="muted">Tang giam so luong nhanh va xem thanh tien tung dong.</p>

                {cartItems.length === 0 ? (
                    <p className="muted" style={{ marginTop: "12px" }}>Gio hang trong. Quay lai trang San pham de them hang.</p>
                ) : (
                    <section className="cart-items-list">
                        {cartItems.map((item) => (
                            <article key={item.id} className="cart-item">
                                <div>
                                    <h3 className="cart-item-title">{item.name}</h3>
                                    <p className="muted">Don gia: {formatVnd(item.price)}</p>
                                    <p className="cart-line-total">Thanh tien: {formatVnd(item.quantity * item.price)}</p>
                                </div>
                                <div className="cart-qty-box">
                                    <button onClick={() => onDecreaseCart(item.id)}>-</button>
                                    <span className="cart-qty">{item.quantity}</span>
                                    <button onClick={() => onAddToCart(item.id)}>+</button>
                                </div>
                                <button className="cart-remove-btn" onClick={() => onRemoveFromCart(item.id)}>
                                    Xoa
                                </button>
                            </article>
                        ))}
                    </section>
                )}
            </section>

            <aside className="panel cart-summary-panel">
                <h3>Tong ket gio hang</h3>
                <div className="cart-summary-grid">
                    <div className="cart-summary-row">
                        <span>Tong so luong</span>
                        <strong>{cartCount}</strong>
                    </div>
                    <div className="cart-summary-row">
                        <span>Tam tinh</span>
                        <strong>{formatVnd(cartTotal)}</strong>
                    </div>
                </div>
                <button className="primary" style={{ width: "100%", marginTop: "10px" }}>
                    Tien hanh dat hang
                </button>
                <button style={{ width: "100%", marginTop: "8px" }} onClick={onClearCart}>
                    Xoa toan bo gio
                </button>
            </aside>
        </section>
    );
}

function App() {
    const [products, setProducts] = React.useState([]);
    const [dataSource, setDataSource] = React.useState("postgres");
    const [isLoading, setIsLoading] = React.useState(true);
    const [loadError, setLoadError] = React.useState("");
    const [keyword, setKeyword] = React.useState("");
    const [sortBy, setSortBy] = React.useState("default");
    const [showSaleOnly, setShowSaleOnly] = React.useState(false);
    const [favorites, setFavorites] = React.useState([]);
    const [lastViewed, setLastViewed] = React.useState(null);
    const [quickViewCount, setQuickViewCount] = React.useState(0);
    const [currentPage, setCurrentPage] = React.useState(() => (window.location.hash === "#/cart" ? "cart" : "products"));
    const [cart, setCart] = React.useState(() => {
        try {
            const savedCart = localStorage.getItem("practice_cart");
            return savedCart ? JSON.parse(savedCart) : {};
        } catch (error) {
            return {};
        }
    });

    React.useEffect(() => {
        let isMounted = true;

        async function loadProductsFromPostgresApi() {
            setIsLoading(true);
            setLoadError("");

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 7000);

            try {
                const response = await fetch(productsApiUrl, {
                    cache: "no-store",
                    signal: controller.signal
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status} - ${errorText}`);
                }

                const json = await response.json();
                const rawProducts = Array.isArray(json) ? json : json.items;
                const mappedProducts = (rawProducts || []).map(normalizeProductFromApi);

                if (isMounted && mappedProducts.length > 0) {
                    setProducts(mappedProducts);
                    setDataSource("postgres");
                } else if (isMounted) {
                    setProducts(fallbackProducts);
                    setDataSource("fallback");
                    setLoadError("API PostgreSQL tra ve rong, da dung du lieu fallback.");
                }
            } catch (error) {
                if (isMounted) {
                    setProducts(fallbackProducts);
                    setDataSource("fallback");
                    setLoadError(`Khong goi duoc API PostgreSQL: ${error.message}`);
                }
            } finally {
                clearTimeout(timeoutId);
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadProductsFromPostgresApi();

        return () => {
            isMounted = false;
        };
    }, []);

    React.useEffect(() => {
        localStorage.setItem("practice_cart", JSON.stringify(cart));
    }, [cart]);

    React.useEffect(() => {
        function handleHashChange() {
            setCurrentPage(window.location.hash === "#/cart" ? "cart" : "products");
        }

        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    React.useEffect(() => {
        if (currentPage === "cart") {
            window.location.hash = "#/cart";
        } else {
            window.location.hash = "#/products";
        }
    }, [currentPage]);

    function handleQuickView(product) {
        setLastViewed(product);
        setQuickViewCount((prev) => prev + 1);
    }

    function handleToggleFavorite(productId) {
        setFavorites((prev) => {
            if (prev.includes(productId)) {
                return prev.filter((id) => id !== productId);
            }
            return [...prev, productId];
        });
    }

    function handleAddToCart(productId) {
        setCart((prev) => ({
            ...prev,
            [productId]: (prev[productId] || 0) + 1
        }));
    }

    function handleDecreaseCart(productId) {
        setCart((prev) => {
            const currentQty = prev[productId] || 0;
            if (currentQty <= 1) {
                const next = { ...prev };
                delete next[productId];
                return next;
            }
            return {
                ...prev,
                [productId]: currentQty - 1
            };
        });
    }

    function handleRemoveFromCart(productId) {
        setCart((prev) => {
            const next = { ...prev };
            delete next[productId];
            return next;
        });
    }

    function handleClearCart() {
        setCart({});
    }

    const filteredProducts = products
        .filter((item) => item.name.toLowerCase().includes(keyword.trim().toLowerCase()))
        .filter((item) => (showSaleOnly ? item.sale : true));

    const productsToRender = [...filteredProducts].sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        return a.id - b.id;
    });

    const cartItems = Object.entries(cart)
        .map(([id, quantity]) => {
            const product = products.find((item) => item.id === Number(id));
            if (!product) return null;
            return {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: Number(quantity)
            };
        })
        .filter(Boolean);

    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cartItems.reduce((total, item) => total + item.quantity * item.price, 0);

    return (
        <main className="page">
            <header className="hero">
                <h1 className="title">Buoi 1 - Product va Gio Hang Tach Trang</h1>
                <p className="sub">Du lieu lay tu PostgreSQL API. Su dung useState de quan ly gio hang, useEffect de dong bo du lieu va localStorage.</p>
                <div className="chip-row">
                    <button className={"chip " + (currentPage === "products" ? "primary" : "")} onClick={() => setCurrentPage("products")}>Trang san pham</button>
                    <button className={"chip " + (currentPage === "cart" ? "primary" : "")} onClick={() => setCurrentPage("cart")}>Trang gio hang ({cartCount})</button>
                </div>
            </header>

            {currentPage === "products" ? (
                <ProductPage
                    productsToRender={productsToRender}
                    products={products}
                    dataSource={dataSource}
                    apiBaseUrl={apiBaseUrl}
                    keyword={keyword}
                    sortBy={sortBy}
                    showSaleOnly={showSaleOnly}
                    favorites={favorites}
                    cart={cart}
                    isLoading={isLoading}
                    loadError={loadError}
                    quickViewCount={quickViewCount}
                    lastViewed={lastViewed}
                    onKeywordChange={setKeyword}
                    onSortChange={setSortBy}
                    onToggleSaleOnly={() => setShowSaleOnly((prev) => !prev)}
                    onResetFilter={() => {
                        setKeyword("");
                        setSortBy("default");
                        setShowSaleOnly(false);
                    }}
                    onQuickView={handleQuickView}
                    onToggleFavorite={handleToggleFavorite}
                    onAddToCart={handleAddToCart}
                />
            ) : (
                <CartPage
                    cartItems={cartItems}
                    cartCount={cartCount}
                    cartTotal={cartTotal}
                    onAddToCart={handleAddToCart}
                    onDecreaseCart={handleDecreaseCart}
                    onRemoveFromCart={handleRemoveFromCart}
                    onClearCart={handleClearCart}
                />
            )}
        </main>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
