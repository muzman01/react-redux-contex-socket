import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  createContext,
} from "react";

// redux
import { useAppDispatch, useAppSelector } from "../store/store";
import {
  setId,
  setCreatedAt,
  setText,
  setFrom,
  setTo,
} from "../store/message/messageSlice";

//types
interface IWebSocket {
  ws: WebSocket | null;
  status: IWebSocketStatus;
}

interface IWebSocketProvider {
  name: string;
  email: string;
  children: React.ReactNode;
}
export enum IWebSocketStatus {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

export const MessageContext = createContext<IWebSocket>({
  ws: null,
  status: IWebSocketStatus.CLOSED,
});
const aa = "23";
export default function MessageContextProvider(props: IWebSocketProvider) {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.message);

  // websocket instance
  const ws = useRef<WebSocket | null>(null);
  // const wsStatus = useRef<IWebSocketStatus>(IWebSocketStatus.CLOSED);
  const [wsStatus, setWsStatus] = useState<IWebSocketStatus>(
    IWebSocketStatus.CLOSED
  );
  const [logined, setLogined] = useState(false);
  console.log(logined);

  // initialize websocket instance
  const initialize = useCallback(() => {
    if (ws.current || !props.email) return; // prevent re-mount websocket

    ws.current = new WebSocket("ws://localhost:443");
    setupListeners();
  }, [ws.current, props.email]);

  // setup listeners
  const setupListeners = useCallback(() => {
    if (!ws.current) return;

    setWsStatus(IWebSocketStatus.CONNECTING);

    ws.current.onopen = () => {
      console.log("connected");
      setWsStatus(IWebSocketStatus.OPEN);
      subscribe();
    };

    ws.current.onclose = () => {
      console.log("disconnected");
      setWsStatus(IWebSocketStatus.CLOSED);
      // unsubscribe(props.ticker, props.tickSize);
      destroy();
    };

    ws.current.onerror = () => {
      console.log("error");
      setWsStatus(IWebSocketStatus.CLOSED);
      // unsubscribe(props.ticker, props.tickSize);
      destroy();
    };

    ws.current.onmessage = onMessage;
  }, [ws.current]);

  // destroy websocket instance
  const destroy = useCallback(() => {
    // check if there is a websocket instance and if it is open
    if (!ws.current || ws.current.readyState === 0) return;

    unsubscribe();
    ws.current.close();
    // ws.current = null;
  }, [ws.current]);

  // subscribe to channels
  const subscribe = useCallback(() => {
    if (!ws.current || ws.current.readyState !== 1) return;

    // login
    ws.current.send(
      JSON.stringify({
        type: "login",
        args: [
          {
            name: props.name,
            email: props.email,
          },
        ],
      })
    );
  }, [ws.current]);

  // unsubscribe from channels
  const unsubscribe = useCallback(
    // previous ticker and tickSize
    (text?: string, id?: string) => {
      if (!ws.current || ws.current.readyState !== 1) return;
    },
    [ws.current]
  );

  // handle on message event
  const onMessage = useCallback(
    (event: MessageEvent) => {
      if (event.data === "login" || event.data.startsWith("error")) return;

      const ticker =
        typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      console.log(ticker);

      if (!ticker) return;

      // if operation is login
      if (ticker.event === "login") {
        if (!ws.current || ticker.code !== "0") return;
        setLogined(true);

        ws.current.send(
          JSON.stringify({
            type: "loadMessages",
            args: [
              {
                receiver: props.name,
                sender: props.name,
              },
            ],
          })
        );

        return;
      }

      // if operation is subscription
      if (ticker.event === "subscribe") {
        return;
      }

      // if operation is updating orders
      if (ticker.type === "loadMessages") {
        console.log(ticker.messages);
      }
    },
    [ws.current, messages]
  );

  // send ping message if no message received in 5 seconds
  const sendPing = useCallback(() => {
    if (!ws.current || ws.current.readyState !== 1) return;

    ws.current.send("ping");
  }, [ws.current]);

  // handle message recieve timeout
  // and send ping if no message recieved in 5 seconds
  React.useEffect(() => {
    if (!ws.current) return;

    let pingTimer: ReturnType<typeof setInterval>;
    let lastMessageReceivedTimestamp: number | null = null;

    // Update the last message received timestamp whenever a message is received
    const handleWebSocketMessage = (event: MessageEvent) => {
      lastMessageReceivedTimestamp = Date.now();
    };

    // handle on message recieved
    ws.current.addEventListener("message", handleWebSocketMessage);

    pingTimer = setInterval(() => {
      if (!ws.current) return;

      // Check if the last message received is more than 5 seconds old
      const currentTime = Date.now();
      if (
        lastMessageReceivedTimestamp &&
        currentTime - lastMessageReceivedTimestamp > 5000
      ) {
        // sendPing();

        // if login is not successful in 5 seconds send login message again
        if (!logined) {
          ws.current.send(
            JSON.stringify({
              type: "login",
              args: [
                {
                  name: props.name,
                  email: props.email,
                },
              ],
            })
          );
        }
      }
    }, 5000);

    return () => {
      if (!ws.current) return;

      clearInterval(pingTimer);
      ws.current.removeEventListener("message", handleWebSocketMessage);
    };
  }, [ws.current, logined]);

  // on first mount
  React.useEffect(() => {
    if (ws.current) return; // prevent re-mount websocket

    initialize();

    return () => {
      if (ws.current) {
        // unsubscribe(props.ticker, props.tickSize);
        destroy();
      }
    };
  }, []);
  const provider = useMemo(() => {
    return {
      ws: ws.current,
      status: wsStatus,
    };
  }, [ws.current, wsStatus]);

  return (
    <MessageContext.Provider value={provider}>
      {props.children}
    </MessageContext.Provider>
  );
}
