import React, { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [savedList, setSavedList] = useState([])

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

  // Calculate discount based on cart items
  const getDiscount = () => {
    const count = cart.length
    if (count >= 5) return 0.15 // 15% off for 5+ items
    if (count >= 3) return 0.10 // 10% off for 3-4 items
    return 0 // No discount for 1-2 items
  }

  // Calculate total price with discount
  const calculateTotal = () => {
    const subtotal = cart.reduce((acc, item) => {
      const price = parseFloat(item.price?.replace(/[^\d.]/g, '') || 0)
      return acc + price * item.quantity
    }, 0)
    const discount = subtotal * getDiscount()
    return {
      subtotal,
      discount,
      total: subtotal - discount,
      discountPercentage: getDiscount() * 100,
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
    getDiscount,
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
