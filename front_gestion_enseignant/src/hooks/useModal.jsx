import React, { createContext, useState, useContext } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    content: null,
    props: {},
  })

  const openModal = (content, props = {}) => {
    setModalState({ isOpen: true, content, props });
  }

  const closeModal = () => {
    setModalState({ isOpen: false, content: null, props: {} });     
  }

  return (
    <ModalContext.Provider value={{ modalState, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  )
};

export const useModal = () => useContext(ModalContext);



