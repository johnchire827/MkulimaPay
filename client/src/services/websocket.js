class WebSocketService {
    constructor() {
      this.socket = null;
      this.subscribers = {};
      this.reconnectInterval = 5000; // 5 seconds
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 10;
    }
  
    connect() {
      if (this.socket) return;
      
      this.socket = new WebSocket(process.env.REACT_APP_WS_URL || 'wss://api.mkulimapay.com/ws');
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Resubscribe to all channels
        Object.keys(this.subscribers).forEach(channel => {
          this.send({ type: 'subscribe', channel });
        });
      };
      
      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.notifySubscribers(message.channel, message.data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.socket.onclose = (event) => {
        console.log(`WebSocket closed: ${event.reason}`);
        this.socket = null;
        this.reconnect();
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.socket.close();
      };
    }
    
    reconnect() {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnect attempts reached');
        return;
      }
      
      this.reconnectAttempts++;
      console.log(`Reconnecting attempt ${this.reconnectAttempts}...`);
      
      setTimeout(() => this.connect(), this.reconnectInterval);
    }
    
    send(message) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(message));
      }
    }
    
    subscribe(channel, callback) {
      if (!this.subscribers[channel]) {
        this.subscribers[channel] = [];
      }
      
      this.subscribers[channel].push(callback);
      
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.send({ type: 'subscribe', channel });
      } else {
        this.connect();
      }
    }
    
    unsubscribe(channel, callback) {
      if (!this.subscribers[channel]) return;
      
      this.subscribers[channel] = this.subscribers[channel].filter(cb => cb !== callback);
      
      if (this.subscribers[channel].length === 0) {
        delete this.subscribers[channel];
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.send({ type: 'unsubscribe', channel });
        }
      }
    }
    
    notifySubscribers(channel, data) {
      if (this.subscribers[channel]) {
        this.subscribers[channel].forEach(callback => callback(data));
      }
    }
  }
  
  export default new WebSocketService();