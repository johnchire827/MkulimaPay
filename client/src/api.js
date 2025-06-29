import axios from 'axios';

const API_BASE = '/api/v1';

export const getUserOrders = (userId) => axios.get(`${API_BASE}/orders?user_id=${userId}`);
export const getUserBids = (userId) => axios.get(`${API_BASE}/bids?buyer_id=${userId}`);
