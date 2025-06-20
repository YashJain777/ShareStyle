export const deleteOrder = (orderId: string): void => {
  const ordersData = localStorage.getItem("orders")
  if (!ordersData) return

  const orders = JSON.parse(ordersData)
  const updatedOrders = orders.filter((order: any) => order.id !== orderId)

  localStorage.setItem("orders", JSON.stringify(updatedOrders))
  window.dispatchEvent(new Event("storage"))
}
