
import { useEffect, useState } from 'react'
import './App.css'

const API = 'http://localhost:8081/api/foods'
const AUTH_API = 'http://localhost:8081/api/auth'
const ORDER_API = 'http://localhost:8081/api/orders'

function App() {
  const [page, setPage] = useState('login')
  const [user, setUser] = useState(null)

  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')

  const [foods, setFoods] = useState([])
  const [cart, setCart] = useState([])
  const [history, setHistory] = useState([])
  const [orders, setOrders] = useState([])

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Biryani')
  const [editId, setEditId] = useState(null)

  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [orderId, setOrderId] = useState('')
  const [orderStatus, setOrderStatus] = useState('')
  const [trackedOrder, setTrackedOrder] = useState(null)

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const isAdmin = user?.role === 'ADMIN'
  const statuses = [
    'PLACED',
    'PREPARING',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
  ]

  async function readResponse(response) {
    const text = await response.text()
    let data = {}

    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = { message: text }
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || `Request failed (${response.status})`)
    }

    return data
  }

  async function loadFoods() {
    try {
      const response = await fetch(API)
      const data = await readResponse(response)
      setFoods(Array.isArray(data) ? data : [])
    } catch (error) {
      setMessage(`Menu error: ${error.message}`)
    }
  }

  useEffect(() => {
    if (user) loadFoods()
  }, [user])

  async function handleAuth(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const isSignup = page === 'signup'

    try {
      const response = await fetch(
        `${AUTH_API}/${isSignup ? 'signup' : 'login'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            isSignup
              ? {
                  name: authName.trim(),
                  email: authEmail.trim(),
                  password: authPassword
                }
              : {
                  email: authEmail.trim(),
                  password: authPassword
                }
          )
        }
      )

      const data = await readResponse(response)

      setUser(data)
      setAuthPassword('')
      setMessage(data.message || 'Login successful!')

      if (data.role === 'ADMIN') {
        setPage('admin')
      } else {
        setCustomerName(data.name || '')
        setPage('menu')
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  function clearForm() {
    setName('')
    setDescription('')
    setPrice('')
    setCategory('Biryani')
    setEditId(null)
  }

  function logout() {
    setUser(null)
    setPage('login')
    setAuthName('')
    setAuthEmail('')
    setAuthPassword('')
    setCart([])
    setHistory([])
    setOrders([])
    setTrackedOrder(null)
    setOrderStatus('')
    setMessage('')
    clearForm()
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (
      !name.trim() ||
      !description.trim() ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0
    ) {
      setMessage('Valid food details enter cheyyi.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(
        editId === null ? API : `${API}/${editId}`,
        {
          method: editId === null ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            price: Number(price),
            category
          })
        }
      )

      await readResponse(response)
      setMessage(editId === null ? 'Food added!' : 'Food updated!')
      clearForm()
      await loadFoods()
    } catch (error) {
      setMessage(`Save avvaledhu: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  function startEdit(food) {
    setEditId(food.id)
    setName(food.name || '')
    setDescription(food.description || '')
    setPrice(String(food.price ?? ''))
    setCategory(food.category || 'Biryani')
    setPage('admin')
    setMessage('')
  }

  async function deleteFood(id) {
    if (!window.confirm('Ee food item delete cheyyala?')) return

    try {
      const response = await fetch(`${API}/${id}`, {
        method: 'DELETE'
      })
      await readResponse(response)

      setMessage('Food deleted successfully!')
      if (editId === id) clearForm()
      await loadFoods()
    } catch (error) {
      setMessage(error.message)
    }
  }

  function addToCart(food) {
    setCart(previous => {
      const found = previous.find(item => item.id === food.id)

      if (found) {
        return previous.map(item =>
          item.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...previous, { ...food, quantity: 1 }]
    })

    setMessage(`${food.name} added to cart!`)
  }

  function changeQuantity(id, amount) {
    setCart(previous =>
      previous
        .map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter(item => item.quantity > 0)
    )
  }

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity, 0
  )

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  )

  async function placeOrder(event) {
    event.preventDefault()

    if (!cart.length) {
      setMessage('Cart empty ga undhi.')
      return
    }

    if (!user?.email) {
      setMessage('Login email dorakaledhu. Malli login cheyyi.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(ORDER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: user.email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          items: cart.map(item => ({
            foodId: item.id,
            quantity: item.quantity
          }))
        })
      })

      const data = await readResponse(response)

      setOrderId(String(data.id))
      setOrderStatus(data.status || 'PLACED')
      setTrackedOrder(data)
      setCart([])
      setPage('track')
      setMessage(`Order placed successfully! Order ID: ${data.id}`)
    } catch (error) {
      setMessage(`Order error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function trackOrder(event) {
    if (event) event.preventDefault()

    if (!orderId.trim()) {
      setMessage('Order ID enter cheyyi.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `${ORDER_API}/${encodeURIComponent(orderId.trim())}`
      )

      const data = await readResponse(response)
      setTrackedOrder(data)
      setOrderStatus(data.status || 'UNKNOWN')
      setMessage(`Order #${data.id} details loaded.`)
    } catch (error) {
      setTrackedOrder(null)
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadHistory() {
    if (!user?.email) {
      setMessage('Customer email dorakaledhu.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(
        `${ORDER_API}/customer?email=${encodeURIComponent(user.email)}`
      )

      const data = await readResponse(response)
      setHistory(Array.isArray(data) ? data : [])
      setMessage('Order history loaded.')
    } catch (error) {
      setMessage(`History load avvaledhu: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function loadAllOrders() {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(ORDER_API)
      const data = await readResponse(response)
      setOrders(Array.isArray(data) ? data : [])
      setMessage('All orders loaded.')
    } catch (error) {
      setMessage(`Orders load avvaledhu: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(id, status) {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${ORDER_API}/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      await readResponse(response)
      setMessage(`Order #${id} status updated: ${status}`)
      await loadAllOrders()
    } catch (error) {
      setMessage(`Status update avvaledhu: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  function money(value) {
    return `₹${Number(value || 0).toFixed(2)}`
  }

  function OrderCard({ order, admin = false }) {
    return (
      <div className="admin-food-card" key={order.id}>
        <div>
          <h3>Order #{order.id}</h3>
          {admin && (
            <>
              <p>Customer: {order.customerName}</p>
              <p>Email: {order.customerEmail}</p>
              <p>Phone: {order.phone}</p>
              <p>Address: {order.address}</p>
            </>
          )}

          <p>
            Items:{' '}
            {(order.items || []).map(item =>
              `${item.foodName || 'Food'} × ${item.quantity}`
            ).join(', ') || 'No item details'}
          </p>

          <p>Total: <strong>{money(order.totalAmount)}</strong></p>
          <p>Status: <strong>{order.status || 'PLACED'}</strong></p>
          {order.orderTime && (
            <p>Order time: {String(order.orderTime).replace('T', ' ')}</p>
          )}
        </div>

        {admin ? (
          <div>
            <label>Update Status</label>
            <select
              value={order.status || 'PLACED'}
              disabled={loading}
              onChange={e => updateOrderStatus(order.id, e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        ) : (
          <button
            onClick={() => {
              setOrderId(String(order.id))
              setTrackedOrder(order)
              setOrderStatus(order.status || 'PLACED')
              setPage('track')
              setMessage('')
            }}
          >
            Track Order
          </button>
        )}
      </div>
    )
  }

  // LOGIN / SIGNUP
  if (!user) {
    const isSignup = page === 'signup'

    return (
      <div className="app">
        <header className="navbar">
          <h2>🍴 Foodie</h2>
          <span>Food Delivery App</span>
        </header>

        <main className="admin-container">
          <section className="admin-form">
            <h1>{isSignup ? 'Create Account' : 'Welcome Back!'}</h1>
            <p>{isSignup ? 'Join Foodie today.' : 'Login to continue.'}</p>

            {message && <p className="admin-message">{message}</p>}

            <form onSubmit={handleAuth}>
              {isSignup && (
                <>
                  <label>Full Name</label>
                  <input
                    value={authName}
                    onChange={e => setAuthName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </>
              )}

              <label>Email</label>
              <input
                type="email"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                autoComplete="email"
                required
              />

              <label>Password</label>
              <input
                type="password"
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                minLength={isSignup ? 8 : undefined}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                required
              />

              <button disabled={loading}>
                {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Login'}
              </button>
            </form>

            <p>
              {isSignup ? 'Already registered? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => {
                  setPage(isSignup ? 'login' : 'signup')
                  setMessage('')
                }}
              >
                {isSignup ? 'Login' : 'Sign Up'}
              </button>
            </p>
          </section>
        </main>
      </div>
    )
  }

  // CUSTOMER PAGES
  if (!isAdmin) {
    return (
      <div className="app">
        <header className="navbar">
          <h2>🍴 Foodie</h2>
          <span>Welcome, {user.name || user.email}!</span>

          <div className="customer-nav">
            <button onClick={() => { setPage('menu'); setMessage('') }}>
              Menu
            </button>
            <button onClick={() => { setPage('cart'); setMessage('') }}>
              🛒 Cart ({cartCount})
            </button>
            <button onClick={() => { setPage('checkout'); setMessage('') }}>
              Checkout
            </button>
            <button onClick={() => { setPage('history'); loadHistory() }}>
              Order History
            </button>
            <button onClick={() => {
              setPage('track')
              setTrackedOrder(null)
              setOrderStatus('')
              setMessage('')
            }}>
              Track Order
            </button>
            <button onClick={logout}>Logout</button>
          </div>
        </header>

        <main className="admin-container">
          {message && (
            <p className="admin-message" role="status">{message}</p>
          )}

          {page === 'menu' && (
            <section className="admin-menu">
              <h1>🍔 Our Food Menu</h1>
              <p>Choose your favourite food!</p>

              {foods.length === 0 && <p>No foods available yet.</p>}

              {foods.map(food => (
                <div className="admin-food-card" key={food.id}>
                  <div>
                    <small>{food.category}</small>
                    <h3>{food.name}</h3>
                    <p>{food.description}</p>
                    <strong>{money(food.price)}</strong>
                  </div>
                  <button onClick={() => addToCart(food)}>
                    Add to Cart
                  </button>
                </div>
              ))}
            </section>
          )}

          {page === 'cart' && (
            <section className="admin-menu">
              <h1>🛒 Your Cart</h1>

              {cart.length === 0 && <p>Your cart is empty.</p>}

              {cart.map(item => (
                <div className="admin-food-card" key={item.id}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{money(item.price)} × {item.quantity}</p>
                    <strong>{money(item.price * item.quantity)}</strong>
                  </div>

                  <div>
                    <button onClick={() => changeQuantity(item.id, -1)}>−</button>
                    {' '}{item.quantity}{' '}
                    <button onClick={() => changeQuantity(item.id, 1)}>+</button>
                  </div>
                </div>
              ))}

              <h2>Total: {money(cartTotal)}</h2>

              {cart.length > 0 && (
                <button onClick={() => { setPage('checkout'); setMessage('') }}>
                  Proceed to Checkout
                </button>
              )}
            </section>
          )}

          {page === 'checkout' && (
            <section className="admin-form">
              <h1>📦 Checkout</h1>

              {cart.length === 0 ? (
                <>
                  <p>Your cart is empty. Menu nunchi food select cheyyi.</p>
                  <button onClick={() => setPage('menu')}>Go to Menu</button>
                </>
              ) : (
                <>
                  <h3>Total: {money(cartTotal)}</h3>
                  <p>Payment: Cash on Delivery (COD)</p>

                  <form onSubmit={placeOrder}>
                    <label>Customer Name</label>
                    <input
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      required
                    />

                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      pattern="[0-9]{10}"
                      title="Enter a 10-digit phone number"
                      required
                    />

                    <label>Delivery Address</label>
                    <textarea
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      rows="4"
                      required
                    />

                    <button type="submit" disabled={loading}>
                      {loading ? 'Placing Order...' : 'Place Order (COD)'}
                    </button>
                  </form>
                </>
              )}
            </section>
          )}

          {page === 'history' && (
            <section className="admin-menu">
              <h1>📋 My Order History</h1>
              <button onClick={loadHistory} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh History'}
              </button>

              {history.length === 0 ? (
                <p>No orders found for this account yet.</p>
              ) : (
                history.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))
              )}
            </section>
          )}

          {page === 'track' && (
            <section className="admin-form">
              <h1>📍 Track Order</h1>

              <form onSubmit={trackOrder}>
                <label>Order ID</label>
                <input
                  value={orderId}
                  onChange={e => setOrderId(e.target.value)}
                  placeholder="Enter your order ID"
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Checking...' : 'Check Order Status'}
                </button>
              </form>

              {trackedOrder && (
                <OrderCard order={trackedOrder} />
              )}

              {!trackedOrder && orderStatus && (
                <p>Status: <strong>{orderStatus}</strong></p>
              )}
            </section>
          )}
        </main>
      </div>
    )
  }

  // ADMIN PAGES
  return (
    <div className="app">
      <header className="navbar">
        <h2>🍴 Foodie Admin</h2>
        <span>Welcome, {user.name || user.email}!</span>
        <button onClick={logout}>Logout</button>
        <span>Food Items: {foods.length}</span>
      </header>

      <main className="admin-container">
        <div className="customer-nav">
          <button onClick={() => setPage('admin')}>Manage Foods</button>
          <button onClick={() => { setPage('adminOrders'); loadAllOrders() }}>
            Manage Orders
          </button>
        </div>

        {message && <p className="admin-message" role="status">{message}</p>}

        {page === 'adminOrders' ? (
          <section className="admin-menu">
            <h1>📦 Customer Orders</h1>
            <button onClick={loadAllOrders} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh Orders'}
            </button>

            {orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              orders.map(order => (
                <OrderCard key={order.id} order={order} admin />
              ))
            )}
          </section>
        ) : (
          <>
            <section className="admin-form">
              <h1>{editId === null ? 'Add New Food' : 'Edit Food'}</h1>
              <p>Food menu ni ikkada manage cheyyachu.</p>

              <form onSubmit={handleSubmit}>
                <label>Food Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />

                <label>Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />

                <label>Price (₹)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                />

                <label>Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option>Biryani</option>
                  <option>Pizza</option>
                  <option>Burger</option>
                  <option>Starters</option>
                  <option>Desserts</option>
                  <option>Drinks</option>
                  <option>Other</option>
                </select>

                <button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editId === null ? 'Add Food' : 'Update Food'}
                </button>

                {editId !== null && (
                  <button type="button" onClick={clearForm}>
                    Cancel Edit
                  </button>
                )}
              </form>
            </section>

            <section className="admin-menu">
              <h2>Manage Food Menu 🍽️</h2>

              {foods.map(food => (
                <div className="admin-food-card" key={food.id}>
                  <div>
                    <small>{food.category}</small>
                    <h3>{food.name}</h3>
                    <p>{food.description}</p>
                    <strong>{money(food.price)}</strong>
                  </div>

                  <div className="admin-actions">
                    <button onClick={() => startEdit(food)}>Edit</button>
                    <button
                      className="delete-button"
                      onClick={() => deleteFood(food.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default App
