import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { wishlistApi } from '../api'
const CartContext = createContext()

const load = (key, fallback) => {
  try {
    const s = localStorage.getItem(key)
    return s ? JSON.parse(s) : fallback
  } catch { return fallback }
}

const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export const CartProvider = ({ children }) => {
  const [cart, setCartState] = useState(() => load('art_cart', []))
  const [savedList, setSavedListState] = useState(() => load('art_savedlist', []))
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      wishlistApi.get().then(res => {
        const items = res.data?.data || []
        const formatted = items.map(v => ({ id: v._id }))
        setSavedListState(formatted)
        save('art_savedlist', formatted)
      }).catch(() => {})
    } else {
      setSavedListState([])
      save('art_savedlist', [])
    }
  }, [isAuthenticated])

  const setCart = (updater) => {
    setCartState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      save('art_cart', next)
      return next
    })
  }

  const setSavedList = (updater) => {
    setSavedListState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      save('art_savedlist', next)
      return next
    })
  }

  // Add or remove from cart
  const toggleCart = (video) => {
    setCart((prevCart) => {
      const exists = prevCart.find((item) => item.id === video.id)
      if (exists) {
        return prevCart.filter((item) => item.id !== video.id)
      } else {
        return [...prevCart, { ...video, quantity: 1 }]
      }
    })
  }

  // Add or remove from saved list
  const toggleSavedList = (video) => {
    setSavedList((prevList) => {
      const exists = prevList.find((item) => item.id === video.id)
      if (exists) {
        return prevList.filter((item) => item.id !== video.id)
      } else {
        return [...prevList, video]
      }
    })
  }

  // Check if video is in cart
  const isInCart = (videoId) => cart.some((item) => item.id === videoId)

  // Check if video is in saved list
  const isInSavedList = (videoId) => savedList.some((item) => item.id === videoId)

  // Calculate total price with 3% platform fee
  const calculateTotal = () => {
    const subtotal = cart.reduce((acc, item) => {
      const price = parseFloat(String(item.price || '0').replace(/[^0-9.]/g, '').replace(/^\.+/, '')) || 0
      return acc + price * item.quantity
    }, 0)
    
    const platformFee = subtotal * 0.03 // 3% platform & convenience fee
    
    return {
      subtotal,
      discount: 0,
      platformFee,
      total: subtotal + platformFee,
      discountPercentage: 0,
    }
  }

  // Get cart summary
  const getCartSummary = () => {
    const pricing = calculateTotal()
    return {
      itemCount: cart.length,
      items: cart,
      ...pricing,
    }
  }

  const value = {
    cart,
    savedList,
    toggleCart,
    toggleSavedList,
    isInCart,
    isInSavedList,
    calculateTotal,
    getCartSummary,
    setCart,
    setSavedList,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
