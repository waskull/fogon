export enum statusEnum{
    WAITING = "Esperando entrega",
    COOKING = "En proceso de preparación",
    INCOMPLETE = "Esperando confirmación de pago",
    COMPLETED_TABLE = "Comida servida",
    COMPLETED = "Producto entregado",
    CANCELED = "Pedido cancelado por el usuario",
    CANCELED_SYSTEM = "Pedido cancelado por el sistema"
}

export enum Method{
    Cash = "Efectivo",
    Credit_Card = "Tarjeta de credito",
    Transfer = "Transferencia",
    Debit_Card = "Tarjeta de debito",
    Mobile = "Pago Móvil"
}