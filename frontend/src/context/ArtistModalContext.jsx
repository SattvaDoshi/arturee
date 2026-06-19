import React, { createContext, useContext, useState } from 'react'

const ArtistModalContext = createContext()

export const ArtistModalProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <ArtistModalContext.Provider value={{ isModalOpen, openModal, closeModal }}>
      {children}
    </ArtistModalContext.Provider>
  )
}

export const useArtistModal = () => {
  const context = useContext(ArtistModalContext)
  if (!context) {
    throw new Error('useArtistModal must be used within ArtistModalProvider')
  }
  return context
}
