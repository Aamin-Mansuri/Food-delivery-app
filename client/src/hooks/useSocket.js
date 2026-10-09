import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { updateLiveOrderStatus } from '../redux/slices/orderSlice';
import { addLiveNotification } from '../redux/slices/notificationSlice';

let socket;

export const useSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) {
      const socketUrl =
        import.meta.env.VITE_SOCKET_URL ||
        (window.location.port === '5173' ? 'http://localhost:5000' : window.location.origin);

      socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
      });
    }

    socket.on('orderStatusChanged', (order) => {
      dispatch(updateLiveOrderStatus(order));
      dispatch(
        addLiveNotification({
          _id: `notif_${Date.now()}`,
          title: 'Order Status Update 🛵',
          message: `Order #${order.orderId} status changed to ${order.orderStatus}`,
          type: 'ORDER_UPDATE',
          isRead: false,
          createdAt: new Date().toISOString(),
        })
      );
    });

    return () => {
      socket.off('orderStatusChanged');
    };
  }, [dispatch]);

  return socket;
};
