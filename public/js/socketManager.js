class SocketManager {
    static eventSocket = null;
    static hostSockets = new Map();

    static eventCallbacks = new Map();
    static hostCallbacks = new Map();

    static eventRoom;

    static createSocket() {
        const socket = io();
        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
        return socket;
    }

    static init() {
        if (!SocketManager.eventSocket) {
            SocketManager.eventSocket = SocketManager.createSocket();

            SocketManager.eventSocket.on('connect', () => {
                if (SocketManager.eventRoom) {
                    SocketManager.eventSocket.emit('join-room', SocketManager.eventRoom);
                }
            });

            SocketManager.eventCallbacks.forEach((callbacks, event) => {
                SocketManager.eventSocket.on(event, (data) => {
                    callbacks.forEach(callback => callback(data));
                });
            });
        }
    }

    static getEventSocket() {
        return SocketManager.eventSocket;
    }

    static getHostSocket(hostId) {
        return SocketManager.hostSockets.get(hostId);
    }

    static addHostSocket(hostId) {
        if (!SocketManager.hostSockets.has(hostId)) {
            const socket = SocketManager.createSocket();

            socket.on('connect', () => {
                socket.emit('join-room', hostId);
            });

            SocketManager.hostSockets.set(hostId, socket);
        }
        return SocketManager.hostSockets.get(hostId);
    }

    static removeHostSocket(hostId) {
        if (SocketManager.hostSockets.has(hostId)) {
            const socket = SocketManager.hostSockets.get(hostId);
            socket.emit('leave-room', hostId);
            socket.disconnect();
            SocketManager.hostSockets.delete(hostId);
        }
    }

    static manageCallback(socket, callbacksMap, trigger, callback, ownerId) {
        if (!callbacksMap.has(trigger)) {
            callbacksMap.set(trigger, []);
            socket.on(trigger, (data) => {
                callbacksMap.get(trigger).forEach(cb => {
                    const owner = document.getElementById(cb.ownerId);
                    const boundCallback = cb.callback.bind(owner);
                    boundCallback(data);
                });
            });
        }
        callbacksMap.get(trigger).push({ ownerId: ownerId, callback: callback });
    }

    static addEventCallback(trigger, callback, ownerId) {
        SocketManager.manageCallback(SocketManager.eventSocket, SocketManager.eventCallbacks, trigger, callback, ownerId);
    }

    static addHostCallback(hostId, trigger, callback, ownerId) {
        let hostSocket = SocketManager.getHostSocket(hostId) || SocketManager.addHostSocket(hostId);
        let hostCallbacks = SocketManager.hostCallbacks.get(hostId) || new Map();
        SocketManager.manageCallback(hostSocket, hostCallbacks, trigger, callback, ownerId);
        SocketManager.hostCallbacks.set(hostId, hostCallbacks);
    }

    static removeManagedCallback(callbacksMap, trigger, callbackToRemove, ownerId) {
        if (callbacksMap.has(trigger)) {
            const callbacks = callbacksMap.get(trigger).filter(cb => (cb.ownerId !== ownerId || cb.callback !== callbackToRemove));

            if (callbacks.length === 0) {
                socket.off(trigger);
            }

            callbacksMap.set(trigger, callbacks);

            if (callbacks.length === 0) {
                callbacksMap.delete(trigger);
            }
        }
    }

    static removeEventCallback(trigger, callbackToRemove, ownerId) {
        SocketManager.removeManagedCallback(SocketManager.eventCallbacks, trigger, callbackToRemove, ownerId);
    }

    static removeHostCallback(hostId, trigger, callbackToRemove, ownerId) {
        if (SocketManager.hostCallbacks.has(hostId)) {
            const hostCallbacks = SocketManager.hostCallbacks.get(hostId);
            SocketManager.removeManagedCallback(hostCallbacks, trigger, callbackToRemove, ownerId);

            if (Object.keys(hostCallbacks).length === 0) {
                SocketManager.removeHostSocket(hostId);
            } else {
                SocketManager.hostCallbacks.set(hostId, hostCallbacks);
            }
        }
    }

    static joinEventRoom(eventId) {
        SocketManager.eventRoom = eventId;
        SocketManager.getEventSocket().emit('join-room', eventId);
    }

    static leaveEventRoom(eventId) {
        SocketManager.eventRoom = null;
        SocketManager.getEventSocket().emit('leave-room', eventId);
    }
}
